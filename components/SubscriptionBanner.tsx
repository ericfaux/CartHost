"use client";

import { useState } from "react";
import { AlertCircle, CreditCard, X, RefreshCw } from "lucide-react";

interface SubscriptionBannerProps {
  variant: "past_due" | "trial_ending";
  daysRemaining?: number;
}

export default function SubscriptionBanner({
  variant,
  daysRemaining,
}: SubscriptionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  if (isDismissed) {
    return null;
  }

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
      setIsLoadingPortal(false);
    }
  };

  if (variant === "past_due") {
    return (
      <div className="bg-red-50 border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-medium text-red-800">
                  Payment Failed
                </span>
                <span className="text-red-700 ml-1">
                  — Please update your payment method to continue using CartHost.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManageSubscription}
                disabled={isLoadingPortal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-70"
              >
                {isLoadingPortal ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {isLoadingPortal ? "Opening..." : "Update Payment"}
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 text-red-400 hover:text-red-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "trial_ending" && daysRemaining !== undefined) {
    return (
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-medium text-amber-800">
                  Trial Ending Soon
                </span>
                <span className="text-amber-700 ml-1">
                  — Your free trial ends in {daysRemaining} day
                  {daysRemaining !== 1 ? "s" : ""}. Add a payment method to
                  continue.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManageSubscription}
                disabled={isLoadingPortal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-800 bg-amber-200 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-70"
              >
                {isLoadingPortal ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {isLoadingPortal ? "Opening..." : "Add Payment"}
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 text-amber-400 hover:text-amber-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
