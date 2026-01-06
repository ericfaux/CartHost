'use client';

import { format } from 'date-fns';
import { AlertCircle, CreditCard, Calendar, CheckCircle, Clock } from 'lucide-react';
import { createPortalSession } from '@/app/actions/stripe';
import { getTierFromPriceId, type PlanTier } from '@/lib/subscriptions';

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
  subscription: Subscription;
  isBetaUser?: boolean;
}

const TIER_DISPLAY: Record<PlanTier, { name: string; color: string }> = {
  none: { name: 'No Plan', color: 'text-gray-600' },
  tier1: { name: 'Safety & Compliance', color: 'text-blue-600' },
  tier2: { name: 'Pro Host', color: 'text-purple-600' },
  fleet: { name: 'Fleet Manager', color: 'text-orange-600' },
  beta: { name: 'Founding Member', color: 'text-green-600' },
};

export default function SubscriptionStatus({ subscription, isBetaUser }: Props) {
  const tier = getTierFromPriceId(subscription.price_id);
  const tierDisplay = TIER_DISPLAY[tier];

  const periodEnd = subscription.current_period_end
    ? format(new Date(subscription.current_period_end), 'MMMM d, yyyy')
    : null;

  const isPastDue = subscription.status === 'past_due';
  const isTrialing = subscription.status === 'trialing';
  const isActive = subscription.status === 'active';
  const isCanceling = subscription.cancel_at_period_end;
  const isBeta = tier === 'beta' || isBetaUser;

  // Calculate trial days remaining
  let trialDaysRemaining: number | null = null;
  if (isTrialing && subscription.current_period_end) {
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="bg-surface border border-rule rounded-xl overflow-hidden">
      {/* Status Alerts */}
      <div className="space-y-0">
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

        {isBeta && isActive && (
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
      </div>

      {/* Plan Details */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-ink-subtle mb-1">Current Plan</p>
            <p className={`text-xl font-semibold ${tierDisplay.color}`}>
              {tierDisplay.name}
            </p>
          </div>

          {!isBeta && periodEnd && (
            <div className="text-right">
              <p className="text-sm text-ink-subtle mb-1">
                {isTrialing ? 'Trial ends' : isCanceling ? 'Access until' : 'Renews'}
              </p>
              <p className="text-sm font-medium text-ink">{periodEnd}</p>
            </div>
          )}

          {isBeta && (
            <div className="text-right">
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                <CheckCircle className="h-3 w-3" />
                Lifetime Access
              </span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-ink-subtle">Status:</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isPastDue
              ? 'bg-red-100 text-red-800'
              : isTrialing
              ? 'bg-amber-100 text-amber-800'
              : isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isPastDue && 'Past Due'}
            {isTrialing && 'Trialing'}
            {isActive && !isTrialing && (isCanceling ? 'Active (Canceling)' : 'Active')}
            {!isPastDue && !isTrialing && !isActive && subscription.status}
          </span>
        </div>

        {/* Manage Button */}
        <form action={createPortalSession}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-paper border border-rule rounded-xl font-medium text-ink hover:bg-gray-50 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            {isPastDue ? 'Update Payment Method' : 'Manage Subscription'}
          </button>
        </form>

        {isPastDue && (
          <p className="text-xs text-center text-ink-muted mt-3">
            Update your payment method to restore full access
          </p>
        )}
      </div>
    </div>
  );
}
