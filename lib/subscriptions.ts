export type PlanTier = 'beta' | 'tier1' | 'tier2' | 'fleet' | 'none';

export interface PlanLimits {
  tier: PlanTier;
  name: string;
  maxCarts: number;
  hasRevenueDashboard: boolean;
  hasUpsellLogic: boolean;
  hasMultiUser: boolean;
  hasOwnerReports: boolean;
  hasPrioritySupport: boolean;
}

// Map Stripe price IDs to internal tier names
// These environment variables are set in Vercel
const PRICE_TO_TIER: Record<string, PlanTier> = {
  // Monthly prices
  [process.env.NEXT_PUBLIC_PRICE_TIER1 ?? '']: 'tier1',
  [process.env.NEXT_PUBLIC_PRICE_TIER2 ?? '']: 'tier2',
  [process.env.NEXT_PUBLIC_PRICE_FLEET ?? '']: 'fleet',
  [process.env.NEXT_PUBLIC_PRICE_BETA ?? '']: 'beta',
  // Annual prices
  [process.env.NEXT_PUBLIC_PRICE_TIER1_ANNUAL ?? '']: 'tier1',
  [process.env.NEXT_PUBLIC_PRICE_TIER2_ANNUAL ?? '']: 'tier2',
  [process.env.NEXT_PUBLIC_PRICE_FLEET_ANNUAL ?? '']: 'fleet',
};

const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  none: {
    tier: 'none',
    name: 'No Plan',
    maxCarts: 0,
    hasRevenueDashboard: false,
    hasUpsellLogic: false,
    hasMultiUser: false,
    hasOwnerReports: false,
    hasPrioritySupport: false,
  },
  tier1: {
    tier: 'tier1',
    name: 'Safety & Compliance',
    maxCarts: 1,
    hasRevenueDashboard: false,
    hasUpsellLogic: false,
    hasMultiUser: false,
    hasOwnerReports: false,
    hasPrioritySupport: false,
  },
  tier2: {
    tier: 'tier2',
    name: 'Pro Host',
    maxCarts: 5,
    hasRevenueDashboard: true,
    hasUpsellLogic: true,
    hasMultiUser: false,
    hasOwnerReports: false,
    hasPrioritySupport: false,
  },
  fleet: {
    tier: 'fleet',
    name: 'Fleet Manager',
    maxCarts: 999,
    hasRevenueDashboard: true,
    hasUpsellLogic: true,
    hasMultiUser: true,
    hasOwnerReports: true,
    hasPrioritySupport: true,
  },
  beta: {
    tier: 'beta',
    name: 'Founding Member',
    maxCarts: 999,
    hasRevenueDashboard: true,
    hasUpsellLogic: true,
    hasMultiUser: true,
    hasOwnerReports: true,
    hasPrioritySupport: true,
  },
};

export function getTierFromPriceId(priceId: string | null | undefined): PlanTier {
  if (!priceId) return 'none';
  return PRICE_TO_TIER[priceId] ?? 'none';
}

export function getPlanLimits(priceId: string | null | undefined): PlanLimits {
  const tier = getTierFromPriceId(priceId);
  return PLAN_LIMITS[tier];
}

export function getPlanLimitsByTier(tier: PlanTier): PlanLimits {
  return PLAN_LIMITS[tier];
}

export function isActiveSubscription(status: string | null | undefined): boolean {
  return ['active', 'trialing'].includes(status ?? '');
}

export function canAddCart(currentCartCount: number, priceId: string | null | undefined): boolean {
  const limits = getPlanLimits(priceId);
  return currentCartCount < limits.maxCarts;
}

export function getTrialDaysRemaining(currentPeriodEnd: string | null | undefined): number | null {
  if (!currentPeriodEnd) return null;
  const endDate = new Date(currentPeriodEnd);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// ============================================================================
// Extended Subscription Utilities
// ============================================================================

/**
 * Host type with subscription-related fields
 */
export interface Host {
  id: string;
  email?: string | null;
  full_name?: string | null;
  stripe_customer_id?: string | null;
  subscription_id?: string | null;
  subscription_status?: SubscriptionStatus | null;
  plan_variant?: string | null;
  is_beta_user?: boolean | null;
}

/**
 * Subscription record from the database
 */
export interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  price_id: string | null;
  quantity: number;
  cancel_at_period_end: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
  canceled_at?: string | null;
  ended_at?: string | null;
}

/**
 * All possible subscription statuses
 */
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'
  | 'pending'
  | 'none';

/**
 * High-level subscription state for UI logic
 */
export type SubscriptionState =
  | 'active'           // Paid and current
  | 'trialing'         // In free trial
  | 'trial_ending'     // Trial ending in 7 days or less
  | 'past_due'         // Payment failed, grace period
  | 'canceled'         // Subscription ended
  | 'canceling'        // Will cancel at period end
  | 'pending'          // Signed up but no subscription
  | 'beta'             // Beta/founding member (free)
  | 'none';            // No subscription

/**
 * Get the high-level subscription state for a host
 */
export function getSubscriptionState(
  host: Host,
  subscription?: Subscription | null
): SubscriptionState {
  // Beta users always have access
  if (host.is_beta_user) {
    return 'beta';
  }

  const status = subscription?.status ?? host.subscription_status;

  // No subscription at all
  if (!status || status === 'none' || status === 'pending') {
    return 'pending';
  }

  // Check for canceling (will cancel at period end)
  if (subscription?.cancel_at_period_end && status === 'active') {
    return 'canceling';
  }

  // Check trial ending soon
  if (status === 'trialing' && subscription?.current_period_end) {
    const daysRemaining = getTrialDaysRemaining(subscription.current_period_end);
    if (daysRemaining !== null && daysRemaining <= 7) {
      return 'trial_ending';
    }
    return 'trialing';
  }

  // Map other statuses
  switch (status) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    case 'incomplete':
    case 'paused':
      return 'pending';
    default:
      return 'none';
  }
}

/**
 * Check if a host can access the dashboard
 * Returns true for: active, trialing, past_due (grace period), beta
 */
export function canAccessDashboard(host: Host): boolean {
  // Beta users always have access
  if (host.is_beta_user) {
    return true;
  }

  const status = host.subscription_status;
  const allowedStatuses: SubscriptionStatus[] = ['active', 'trialing', 'past_due'];

  return allowedStatuses.includes(status as SubscriptionStatus);
}

/**
 * Get trial days remaining for a host
 * Returns null if not in trial or no subscription
 */
export function getHostTrialDaysRemaining(
  host: Host,
  subscription?: Subscription | null
): number | null {
  const status = subscription?.status ?? host.subscription_status;

  if (status !== 'trialing') {
    return null;
  }

  // Use trial_end if available, otherwise current_period_end
  const trialEnd = subscription?.trial_end ?? subscription?.current_period_end;

  if (!trialEnd) {
    return null;
  }

  return getTrialDaysRemaining(trialEnd);
}

/**
 * Check if a subscription is considered "active" (can use the service)
 * Includes: active, trialing
 * Does NOT include: past_due (though dashboard access is allowed)
 */
export function isSubscriptionActive(host: Host): boolean {
  if (host.is_beta_user) {
    return true;
  }

  const status = host.subscription_status;
  return status === 'active' || status === 'trialing';
}

/**
 * Check if we should show a payment prompt to the user
 * True for: trialing (especially near end), past_due, canceling
 */
export function shouldShowPaymentPrompt(
  host: Host,
  subscription?: Subscription | null
): boolean {
  // Beta users never need payment prompts
  if (host.is_beta_user) {
    return false;
  }

  const state = getSubscriptionState(host, subscription);

  switch (state) {
    case 'past_due':
      return true; // Always show for past due
    case 'trial_ending':
      return true; // Show when trial is ending
    case 'trialing':
      // Show in last 14 days of trial
      const daysRemaining = getHostTrialDaysRemaining(host, subscription);
      return daysRemaining !== null && daysRemaining <= 14;
    case 'canceling':
      return true; // Encourage reactivation
    default:
      return false;
  }
}

/**
 * Get the urgency level for payment prompts
 */
export function getPaymentUrgency(
  host: Host,
  subscription?: Subscription | null
): 'none' | 'low' | 'medium' | 'high' | 'critical' {
  if (host.is_beta_user) {
    return 'none';
  }

  const state = getSubscriptionState(host, subscription);

  if (state === 'past_due') {
    // Check how long it's been past due
    // For now, just return high since we don't track this
    return 'high';
  }

  if (state === 'trial_ending' || state === 'trialing') {
    const daysRemaining = getHostTrialDaysRemaining(host, subscription);
    if (daysRemaining === null) return 'none';

    if (daysRemaining <= 1) return 'critical';
    if (daysRemaining <= 3) return 'high';
    if (daysRemaining <= 7) return 'medium';
    if (daysRemaining <= 14) return 'low';
    return 'none';
  }

  if (state === 'canceling') {
    return 'medium';
  }

  return 'none';
}

/**
 * Check if the host has ever had a subscription (for trial eligibility)
 */
export function hasHadSubscription(host: Host): boolean {
  return !!(host.stripe_customer_id || host.subscription_id);
}

/**
 * Get a human-readable status message
 */
export function getStatusMessage(
  host: Host,
  subscription?: Subscription | null
): string {
  const state = getSubscriptionState(host, subscription);
  const daysRemaining = getHostTrialDaysRemaining(host, subscription);

  switch (state) {
    case 'beta':
      return 'Founding Member - Lifetime Access';
    case 'active':
      return 'Active Subscription';
    case 'trialing':
      return daysRemaining !== null
        ? `Free Trial - ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
        : 'Free Trial';
    case 'trial_ending':
      return daysRemaining !== null
        ? `Trial Ending - ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`
        : 'Trial Ending Soon';
    case 'past_due':
      return 'Payment Failed - Please update your payment method';
    case 'canceling':
      return 'Subscription ending at period end';
    case 'canceled':
      return 'Subscription Canceled';
    case 'pending':
      return 'No Active Subscription';
    default:
      return 'Unknown Status';
  }
}

/**
 * Calculate days until subscription ends (for canceling subscriptions)
 */
export function getDaysUntilEnd(subscription: Subscription | null | undefined): number | null {
  if (!subscription?.current_period_end) {
    return null;
  }

  if (!subscription.cancel_at_period_end) {
    return null; // Not canceling
  }

  const endDate = new Date(subscription.current_period_end);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}
