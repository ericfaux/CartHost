'use client';

import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { createCheckoutSession } from '@/app/actions/stripe';

type BillingInterval = 'monthly' | 'annual';

interface Tier {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyPriceId: string;
  annualPriceId: string;
  cartLimit: string;
  features: string[];
  isPopular?: boolean;
}

const TIERS: Tier[] = [
  {
    name: 'Safety & Compliance',
    description: 'Everything you need to protect one cart and win disputes.',
    monthlyPrice: 12,
    annualPrice: 122,
    monthlyPriceId: process.env.NEXT_PUBLIC_PRICE_TIER1!,
    annualPriceId: process.env.NEXT_PUBLIC_PRICE_TIER1_ANNUAL!,
    cartLimit: '1 Cart or Hot Tub',
    features: [
      'QR Access Gate + Digital Waiver',
      'Pre-Ride Photo Capture',
      'End-of-Rental Plug-in Verification',
      'Deposit Tracking',
      'Evidence Locker + PDF Claim Pack',
      'Basic Maintenance Log',
    ],
  },
  {
    name: 'Pro Host',
    description: 'Make your amenities pay for themselves and prove it with numbers.',
    monthlyPrice: 20,
    annualPrice: 204,
    monthlyPriceId: process.env.NEXT_PUBLIC_PRICE_TIER2!,
    annualPriceId: process.env.NEXT_PUBLIC_PRICE_TIER2_ANNUAL!,
    cartLimit: 'Up to 5 Vehicles',
    isPopular: true,
    features: [
      'Everything in Safety & Compliance',
      'Revenue & Utilization Dashboard',
      'Upsell / Pay-to-Unlock Logic',
      'Advanced Maintenance Tracking',
      'Service Reminders & Cost per Vehicle',
    ],
  },
  {
    name: 'Fleet Manager',
    description: 'For property managers with many properties and vehicles.',
    monthlyPrice: 40,
    annualPrice: 408,
    monthlyPriceId: process.env.NEXT_PUBLIC_PRICE_FLEET!,
    annualPriceId: process.env.NEXT_PUBLIC_PRICE_FLEET_ANNUAL!,
    cartLimit: '10+ Vehicles',
    features: [
      'Everything in Pro Host',
      'Multi-user: Cleaner/Tech Mode',
      'Owner-Friendly PDF Reports',
      'CSV & Accounting Export',
      'Priority Support & Onboarding',
    ],
  },
];

interface Props {
  currentPriceId?: string | null;
}

export default function SubscriptionPricing({ currentPriceId }: Props) {
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: Tier) => {
    const priceId = interval === 'monthly' ? tier.monthlyPriceId : tier.annualPriceId;
    if (!priceId) return;

    setLoading(priceId);
    try {
      await createCheckoutSession(priceId);
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(null);
    }
  };

  const isCurrentPlan = (tier: Tier) => {
    return currentPriceId === tier.monthlyPriceId || currentPriceId === tier.annualPriceId;
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-surface rounded-full p-1 border border-rule">
          <button
            onClick={() => setInterval('monthly')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              interval === 'monthly'
                ? 'bg-ink text-paper'
                : 'text-ink-subtle hover:text-ink'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('annual')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              interval === 'annual'
                ? 'bg-ink text-paper'
                : 'text-ink-subtle hover:text-ink'
            }`}
          >
            Annual
            <span className={`text-xs font-semibold ${
              interval === 'annual' ? 'text-green-300' : 'text-green-600'
            }`}>
              Save 15%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier) => {
          const price = interval === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
          const period = interval === 'monthly' ? '/mo' : '/yr';
          const effectiveMonthly = interval === 'annual'
            ? (tier.annualPrice / 12).toFixed(0)
            : null;
          const isCurrent = isCurrentPlan(tier);
          const currentPriceIdForTier = interval === 'monthly' ? tier.monthlyPriceId : tier.annualPriceId;

          return (
            <div
              key={tier.name}
              className={`relative flex flex-col p-6 rounded-2xl border transition-shadow ${
                tier.isPopular
                  ? 'border-accent-ops shadow-lg bg-paper'
                  : 'border-rule bg-surface hover:shadow-md'
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-ops text-paper px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Most Popular
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  Current Plan
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-ink">{tier.name}</h3>
                <p className="text-sm text-ink-subtle mt-1">{tier.description}</p>
              </div>

              <div className="mb-1">
                <span className="text-4xl font-bold text-ink">${price}</span>
                <span className="text-ink-subtle">{period}</span>
              </div>

              {effectiveMonthly && (
                <p className="text-xs text-ink-muted mb-4">
                  ${effectiveMonthly}/mo billed annually
                </p>
              )}

              {!effectiveMonthly && <div className="mb-4" />}

              <p className="text-sm font-medium text-accent-ops mb-4">
                {tier.cartLimit}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-ink">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(tier)}
                disabled={!!loading || isCurrent}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all disabled:cursor-not-allowed ${
                  isCurrent
                    ? 'bg-gray-100 text-gray-400'
                    : tier.isPopular
                    ? 'bg-accent-ops text-paper hover:opacity-90 shadow-lg'
                    : 'bg-paper text-ink border border-rule hover:bg-surface'
                }`}
              >
                {loading === currentPriceIdForTier
                  ? 'Redirecting to checkout...'
                  : isCurrent
                  ? 'Current Plan'
                  : 'Start 30-Day Free Trial'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Trial Note */}
      <p className="text-center text-sm text-ink-muted">
        All paid plans include a 30-day free trial. Cancel anytime.
      </p>
    </div>
  );
}
