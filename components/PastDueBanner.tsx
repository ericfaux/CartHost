'use client';

import { useState } from 'react';
import { AlertTriangle, CreditCard, RefreshCw, ExternalLink } from 'lucide-react';

interface PastDueBannerProps {
  /** Number of days the payment has been past due */
  daysPastDue?: number;
  /** Custom message override */
  message?: string;
  /** Direct callback for handling payment update */
  onUpdatePayment?: () => void;
}

/**
 * PastDueBanner Component
 *
 * Shows when subscription_status is 'past_due'.
 * - Urgent styling (red/orange)
 * - Direct link to update payment method via Customer Portal
 * - Cannot be dismissed (no X button)
 */
export default function PastDueBanner({
  daysPastDue,
  message,
  onUpdatePayment,
}: PastDueBannerProps) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdatePayment = async () => {
    if (onUpdatePayment) {
      onUpdatePayment();
      return;
    }

    setIsLoadingPortal(true);
    setError(null);

    try {
      // Use the deep link to go directly to payment method update
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flow: 'payment_method_update',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open payment portal');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to open billing portal:', err);
      setError(err instanceof Error ? err.message : 'Failed to open portal');
      setIsLoadingPortal(false);
    }
  };

  // Determine severity based on days past due
  const isCritical = daysPastDue !== undefined && daysPastDue >= 7;
  const isUrgent = daysPastDue !== undefined && daysPastDue >= 3;

  // Dynamic message based on severity
  const displayMessage =
    message ??
    (isCritical
      ? "Your subscription is at risk of cancellation. Please update your payment immediately."
      : isUrgent
        ? "Your payment is overdue. Update your payment method to avoid service interruption."
        : "Your last payment failed. Please update your payment method to continue using CartHost.");

  // Dynamic styling based on severity
  const bgColor = isCritical ? 'bg-red-100' : 'bg-red-50';
  const borderColor = isCritical ? 'border-red-200' : 'border-red-100';

  return (
    <div className={`${bgColor} border-b ${borderColor}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <AlertTriangle
              className={`h-5 w-5 flex-shrink-0 mt-0.5 sm:mt-0 ${
                isCritical ? 'text-red-700 animate-pulse' : 'text-red-600'
              }`}
            />
            <div className="text-sm">
              <span className="font-semibold text-red-800">
                Payment Failed
                {daysPastDue !== undefined && daysPastDue > 0 && (
                  <span className="font-normal ml-1">
                    ({daysPastDue} day{daysPastDue !== 1 ? 's' : ''} overdue)
                  </span>
                )}
              </span>
              <p className="text-red-700 mt-0.5 sm:mt-0 sm:ml-1 sm:inline">
                {displayMessage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {error && (
              <span className="text-xs text-red-600 mr-2">{error}</span>
            )}
            <button
              onClick={handleUpdatePayment}
              disabled={isLoadingPortal}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-70 ${
                isCritical
                  ? 'bg-red-700 hover:bg-red-800 shadow-lg shadow-red-200'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoadingPortal ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Opening...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Update Payment Method</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Additional warning for critical status */}
        {isCritical && (
          <div className="mt-2 pt-2 border-t border-red-200">
            <p className="text-xs text-red-700 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Your access may be revoked soon. Please update your payment to avoid losing your data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
