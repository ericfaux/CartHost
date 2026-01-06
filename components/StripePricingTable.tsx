'use client';

import { useEffect, useState, useRef } from 'react';

interface StripePricingTableProps {
  clientReferenceId?: string;
  customerEmail?: string;
  className?: string;
}

export function StripePricingTable({
  clientReferenceId,
  customerEmail,
  className = '',
}: StripePricingTableProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const scriptLoadedRef = useRef(false);

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const pricingTableId = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID;

  useEffect(() => {
    // Skip if already loaded or if script element exists
    if (scriptLoadedRef.current || document.querySelector('script[src*="stripe.com/pricing-table"]')) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;

    script.onload = () => {
      scriptLoadedRef.current = true;
      setIsLoaded(true);
    };

    script.onerror = () => {
      setHasError(true);
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove the script on cleanup - other components may need it
    };
  }, []);

  // Show configuration error in development
  if (!publishableKey || !pricingTableId) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className={`bg-amber-50 border border-amber-200 rounded-dossier-surface p-6 text-center ${className}`}>
          <p className="text-amber-800 font-medium mb-2">Stripe Configuration Missing</p>
          <p className="text-amber-700 text-sm">
            Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID in your environment.
          </p>
        </div>
      );
    }
    return null;
  }

  if (hasError) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-dossier-surface p-6 text-center ${className}`}>
        <p className="text-red-800 font-medium mb-2">Failed to load pricing</p>
        <p className="text-red-700 text-sm">
          Please refresh the page or try again later.
        </p>
      </div>
    );
  }

  return (
    <div className={`stripe-pricing-container relative min-h-[400px] ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-accent-ops border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-ink-subtle">Loading pricing options...</p>
          </div>
        </div>
      )}

      {/* Stripe Pricing Table */}
      <div className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* @ts-expect-error - Stripe custom element */}
        <stripe-pricing-table
          pricing-table-id={pricingTableId}
          publishable-key={publishableKey}
          {...(clientReferenceId && { 'client-reference-id': clientReferenceId })}
          {...(customerEmail && { 'customer-email': customerEmail })}
        />
      </div>
    </div>
  );
}

export default StripePricingTable;
