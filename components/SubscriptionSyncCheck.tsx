'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface SubscriptionSyncCheckProps {
  /**
   * The user's current subscription status from the database
   */
  currentStatus: string | null | undefined;
  /**
   * Whether the user has a Stripe customer ID
   */
  hasStripeCustomer: boolean;
  /**
   * Callback when sync completes successfully
   */
  onSyncComplete?: (newStatus: string) => void;
  /**
   * Show in compact mode (smaller, inline)
   */
  compact?: boolean;
}

interface SyncResult {
  synced: boolean;
  host?: {
    subscriptionStatus: string | null;
    planVariant: string | null;
  };
  changes?: string[];
  error?: string;
}

/**
 * SubscriptionSyncCheck Component
 *
 * Handles "limbo" states in subscription management:
 * 1. User in checkout but hasn't completed (abandoned)
 * 2. Subscription created but webhook not yet received (eventual consistency)
 * 3. Status mismatch between local and Stripe
 *
 * This component:
 * - Automatically syncs on mount if status seems stale
 * - Provides manual sync button
 * - Shows sync status and results
 */
export default function SubscriptionSyncCheck({
  currentStatus,
  hasStripeCustomer,
  onSyncComplete,
  compact = false,
}: SubscriptionSyncCheckProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [hasAutoSynced, setHasAutoSynced] = useState(false);

  const syncSubscription = useCallback(async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
      });

      const result: SyncResult = await response.json();
      setSyncResult(result);

      if (result.synced && result.host?.subscriptionStatus) {
        onSyncComplete?.(result.host.subscriptionStatus);
      }
    } catch (error) {
      setSyncResult({
        synced: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      });
    } finally {
      setIsSyncing(false);
    }
  }, [onSyncComplete]);

  // Auto-sync in certain conditions
  useEffect(() => {
    if (hasAutoSynced) return;

    // Conditions for auto-sync:
    // 1. Has Stripe customer but status is 'pending' (possible webhook delay)
    // 2. Status is undefined but has customer (stale data)
    const shouldAutoSync =
      hasStripeCustomer &&
      (!currentStatus || currentStatus === 'pending' || currentStatus === 'incomplete');

    if (shouldAutoSync) {
      setHasAutoSynced(true);
      // Delay slightly to allow webhooks to process
      const timer = setTimeout(() => {
        syncSubscription();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStatus, hasStripeCustomer, hasAutoSynced, syncSubscription]);

  // Don't show anything if no Stripe customer
  if (!hasStripeCustomer) {
    return null;
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        {isSyncing && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Syncing...
          </span>
        )}
        {!isSyncing && syncResult?.changes && syncResult.changes.length > 0 && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Updated
          </span>
        )}
        {!isSyncing && (
          <button
            onClick={syncSubscription}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            title="Refresh subscription status from Stripe"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {isSyncing ? (
            <Clock className="h-5 w-5 text-blue-500 animate-pulse flex-shrink-0 mt-0.5" />
          ) : syncResult?.error ? (
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          ) : syncResult?.synced ? (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <RefreshCw className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
          )}

          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {isSyncing
                ? 'Checking subscription status...'
                : syncResult?.error
                  ? 'Sync Error'
                  : syncResult?.synced
                    ? 'Subscription Synced'
                    : 'Subscription Sync'}
            </p>

            {isSyncing && (
              <p className="text-xs text-gray-600">
                Verifying your subscription with Stripe...
              </p>
            )}

            {syncResult?.error && (
              <p className="text-xs text-red-600">{syncResult.error}</p>
            )}

            {syncResult?.synced && syncResult.changes && syncResult.changes.length > 0 && (
              <ul className="text-xs text-gray-600 space-y-0.5">
                {syncResult.changes.map((change, i) => (
                  <li key={i}>• {change}</li>
                ))}
              </ul>
            )}

            {syncResult?.synced && (!syncResult.changes || syncResult.changes.length === 0) && (
              <p className="text-xs text-gray-600">
                Your subscription is up to date.
              </p>
            )}

            {!isSyncing && !syncResult && (
              <p className="text-xs text-gray-600">
                If your subscription seems out of date, click refresh to sync with Stripe.
              </p>
            )}
          </div>
        </div>

        {!isSyncing && (
          <button
            onClick={syncSubscription}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for subscription sync
 */
export function useSubscriptionSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const sync = async (): Promise<SyncResult> => {
    setIsSyncing(true);

    try {
      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
      });

      const result: SyncResult = await response.json();
      setLastSyncResult(result);
      return result;
    } catch (error) {
      const errorResult: SyncResult = {
        synced: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      };
      setLastSyncResult(errorResult);
      return errorResult;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    sync,
    isSyncing,
    lastSyncResult,
  };
}
