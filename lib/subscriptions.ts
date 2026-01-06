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
