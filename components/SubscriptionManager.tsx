'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  AlertCircle,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { getTierFromPriceId, getTrialDaysRemaining, type PlanTier } from '@/lib/subscriptions';

interface HostProfile {
  id: string;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  subscription_id: string | null;
  plan_variant: string | null;
  is_beta_user: boolean | null;
}

interface Subscription {
  id: string;
  status: string;
  price_id: string | null;
  current_period_end: string | null;
  current_period_start: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
}

interface Props {
  profile: HostProfile;
  subscription?: Subscription | null;
}

const TIER_DISPLAY: Record<PlanTier, { name: string; color: string }> = {
  none: { name: 'No Plan', color: 'text-gray-600' },
  tier1: { name: 'Safety & Compliance', color: 'text-blue-600' },
  tier2: { name: 'Pro Host', color: 'text-purple-600' },
  fleet: { name: 'Fleet Manager', color: 'text-orange-600' },
  beta: { name: 'Founding Member', color: 'text-green-600' },
};

export default function SubscriptionManager({ profile, subscription }: Props) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const hasStripeCustomer = !!profile.stripe_customer_id;
  const hasActiveSubscription = subscription && ['active', 'trialing', 'past_due'].includes(subscription.status);

  const tier = subscription?.price_id ? getTierFromPriceId(subscription.price_id) : 'none';
  const tierDisplay = TIER_DISPLAY[tier];
  const isBetaUser = profile.is_beta_user || tier === 'beta';

  const status = subscription?.status ?? profile.subscription_status ?? 'none';
  const isTrialing = status === 'trialing';
  const isActive = status === 'active';
  const isPastDue = status === 'past_due';
  const isCanceled = status === 'canceled';
  const isCanceling = subscription?.cancel_at_period_end ?? false;

  const trialDaysRemaining = isTrialing && subscription?.current_period_end
    ? getTrialDaysRemaining(subscription.current_period_end)
    : null;

  const periodEnd = subscription?.current_period_end
    ? format(new Date(subscription.current_period_end), 'MMMM d, yyyy')
    : null;

  const handleManageSubscription = async () => {
    if (!hasStripeCustomer) return;

    setIsLoadingPortal(true);
    setPortalError(null);

    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Portal error:', error);
      setPortalError(error instanceof Error ? error.message : 'Failed to open billing portal');
      setIsLoadingPortal(false);
    }
  };

  // Render status badge based on subscription state
  const renderStatusBadge = () => {
    if (isBetaUser && isActive) {
      return <Badge variant="success" icon={<Sparkles className="h-3 w-3" />}>Founding Member</Badge>;
    }
    if (isTrialing && trialDaysRemaining !== null) {
      return <Badge variant="success" pulse>30-Day Trial — {trialDaysRemaining} days left</Badge>;
    }
    if (isActive) {
      return <Badge variant="success">{tierDisplay.name}</Badge>;
    }
    if (isPastDue) {
      return <Badge variant="warning" icon={<AlertCircle className="h-3 w-3" />}>Past Due</Badge>;
    }
    if (isCanceled) {
      return <Badge variant="danger">Canceled</Badge>;
    }
    if (isCanceling) {
      return <Badge variant="warning">Canceling</Badge>;
    }
    return <Badge variant="neutral">No Active Plan</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <div className="rounded-dossier-surface border border-rule bg-surface overflow-hidden">
        {/* Status Alerts */}
        {isPastDue && (
          <div className="bg-red-50 border-b border-red-100 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Payment Failed</p>
              <p className="text-sm text-red-700">
                Please update your payment method to continue using CartHost.
              </p>
            </div>
          </div>
        )}

        {isTrialing && trialDaysRemaining !== null && (
          <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Free Trial — {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining
              </p>
              <p className="text-sm text-amber-700">
                Your trial ends on {periodEnd}. You won&apos;t be charged until then.
              </p>
            </div>
          </div>
        )}

        {isCanceling && !isPastDue && (
          <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800">Subscription Ending</p>
              <p className="text-sm text-gray-700">
                Your access will end on {periodEnd}. You can reactivate anytime before then.
              </p>
            </div>
          </div>
        )}

        {isBetaUser && isActive && (
          <div className="bg-green-50 border-b border-green-100 p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Founding Member</p>
              <p className="text-sm text-green-700">
                You have lifetime free access to all CartHost features. Thank you for being an early supporter!
              </p>
            </div>
          </div>
        )}

        {isCanceled && (
          <div className="bg-red-50 border-b border-red-100 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Subscription Canceled</p>
              <p className="text-sm text-red-700">
                Your subscription has been canceled. Subscribe below to regain access to CartHost features.
              </p>
            </div>
          </div>
        )}

        {/* Main Status Display */}
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-ink-subtle mb-1">Current Plan</p>
                <p className={`text-xl font-semibold ${hasActiveSubscription ? tierDisplay.color : 'text-gray-500'}`}>
                  {hasActiveSubscription ? tierDisplay.name : 'No Active Plan'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-subtle">Status:</span>
                {renderStatusBadge()}
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2">
              {!isBetaUser && periodEnd && hasActiveSubscription && (
                <div className="text-sm text-ink-subtle">
                  {isTrialing ? 'Trial ends' : isCanceling ? 'Access until' : 'Renews'}: <span className="font-medium text-ink">{periodEnd}</span>
                </div>
              )}
              {isBetaUser && hasActiveSubscription && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  <CheckCircle className="h-3 w-3" />
                  Lifetime Access
                </span>
              )}
            </div>
          </div>

          {/* Manage Subscription Button */}
          {hasStripeCustomer && hasActiveSubscription && (
            <div className="mt-6 pt-6 border-t border-rule">
              {portalError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
                  {portalError}
                </div>
              )}
              <button
                onClick={handleManageSubscription}
                disabled={isLoadingPortal}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-paper border border-rule rounded-xl font-medium text-ink hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-wait"
              >
                {isLoadingPortal ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Opening Portal...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    {isPastDue ? 'Update Payment Method' : 'Manage Subscription'}
                  </>
                )}
              </button>
              {isPastDue && (
                <p className="text-xs text-center text-ink-muted mt-3">
                  Update your payment method to restore full access
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing Table - Show for new users or those wanting to upgrade/resubscribe */}
      {(!hasActiveSubscription || isCanceled || isCanceling) && (
        <div className="rounded-dossier-surface border border-rule bg-surface p-6">
          <div className="space-y-1 mb-6">
            <h3 className="text-lg font-semibold text-ink">
              {isCanceled || isCanceling ? 'Reactivate Your Subscription' : 'Choose a Plan'}
            </h3>
            <p className="text-sm text-ink-subtle">
              {isCanceled || isCanceling
                ? 'Select a plan below to continue using CartHost.'
                : 'Start your 30-day free trial and protect your rentals today.'}
            </p>
          </div>

          {/* Stripe Pricing Table */}
          <stripe-pricing-table
            pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID}
            publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
            customer-email={profile.stripe_customer_id ? undefined : undefined}
          />
        </div>
      )}

      {/* Upgrade Option for Active Subscribers */}
      {hasActiveSubscription && !isCanceling && !isBetaUser && (
        <div className="rounded-dossier-surface border border-rule bg-surface p-6">
          <div className="space-y-1 mb-6">
            <h3 className="text-lg font-semibold text-ink">Change Plan</h3>
            <p className="text-sm text-ink-subtle">
              Upgrade or change your plan to unlock more features.
            </p>
          </div>

          {/* Stripe Pricing Table */}
          <stripe-pricing-table
            pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID}
            publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
          />
        </div>
      )}
    </div>
  );
}

// TypeScript declaration for Stripe Pricing Table web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'pricing-table-id'?: string;
          'publishable-key'?: string;
          'customer-email'?: string;
          'client-reference-id'?: string;
        },
        HTMLElement
      >;
    }
  }
}
