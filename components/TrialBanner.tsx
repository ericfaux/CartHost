'use client';

import { useState, useEffect } from 'react';
import { Clock, CreditCard, X, RefreshCw, Sparkles } from 'lucide-react';

interface TrialBannerProps {
  daysRemaining: number;
  trialEndDate?: Date;
  onAddPayment?: () => void;
}

const STORAGE_KEY = 'carthost_trial_banner_dismissed';

interface DismissalState {
  dismissedAt: string;
  daysRemainingWhenDismissed: number;
}

/**
 * TrialBanner Component
 *
 * Shows when subscription_status is 'trialing'.
 * - Displays days remaining in trial
 * - CTA to add payment method
 * - Dismissible but reappears daily in last 7 days
 */
export default function TrialBanner({
  daysRemaining,
  trialEndDate,
  onAddPayment,
}: TrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check dismissal state on mount
  useEffect(() => {
    setMounted(true);

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setIsDismissed(false);
      return;
    }

    try {
      const state: DismissalState = JSON.parse(stored);
      const dismissedAt = new Date(state.dismissedAt);
      const now = new Date();

      // Calculate hours since dismissal
      const hoursSinceDismissal = (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60);

      // In the last 7 days of trial, banner reappears daily
      if (daysRemaining <= 7) {
        // Reappear after 24 hours
        if (hoursSinceDismissal >= 24) {
          localStorage.removeItem(STORAGE_KEY);
          setIsDismissed(false);
        }
      } else {
        // Before last 7 days, respect dismissal but check if days remaining changed significantly
        if (state.daysRemainingWhenDismissed - daysRemaining >= 5) {
          // More than 5 days have passed, show again
          localStorage.removeItem(STORAGE_KEY);
          setIsDismissed(false);
        }
      }
    } catch {
      // Invalid stored data, show banner
      localStorage.removeItem(STORAGE_KEY);
      setIsDismissed(false);
    }
  }, [daysRemaining]);

  const handleDismiss = () => {
    const state: DismissalState = {
      dismissedAt: new Date().toISOString(),
      daysRemainingWhenDismissed: daysRemaining,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setIsDismissed(true);
  };

  const handleAddPayment = async () => {
    if (onAddPayment) {
      onAddPayment();
      return;
    }

    setIsLoadingPortal(true);
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      setIsLoadingPortal(false);
    }
  };

  // Don't render during SSR to avoid hydration mismatch
  if (!mounted || isDismissed) {
    return null;
  }

  // Determine urgency level based on days remaining
  const isUrgent = daysRemaining <= 3;
  const isWarning = daysRemaining <= 7;

  // Dynamic styling based on urgency
  const bgColor = isUrgent
    ? 'bg-red-50'
    : isWarning
      ? 'bg-amber-50'
      : 'bg-blue-50';
  const borderColor = isUrgent
    ? 'border-red-100'
    : isWarning
      ? 'border-amber-100'
      : 'border-blue-100';
  const iconColor = isUrgent
    ? 'text-red-600'
    : isWarning
      ? 'text-amber-600'
      : 'text-blue-600';
  const textColor = isUrgent
    ? 'text-red-800'
    : isWarning
      ? 'text-amber-800'
      : 'text-blue-800';
  const subtextColor = isUrgent
    ? 'text-red-700'
    : isWarning
      ? 'text-amber-700'
      : 'text-blue-700';
  const buttonBg = isUrgent
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : isWarning
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white';
  const dismissColor = isUrgent
    ? 'text-red-400 hover:text-red-600'
    : isWarning
      ? 'text-amber-400 hover:text-amber-600'
      : 'text-blue-400 hover:text-blue-600';

  // Format trial end date
  const formattedEndDate = trialEndDate
    ? trialEndDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className={`${bgColor} border-b ${borderColor}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isUrgent ? (
              <Sparkles className={`h-5 w-5 ${iconColor} flex-shrink-0 animate-pulse`} />
            ) : (
              <Clock className={`h-5 w-5 ${iconColor} flex-shrink-0`} />
            )}
            <div className="text-sm">
              <span className={`font-medium ${textColor}`}>
                {daysRemaining === 0
                  ? 'Trial Ends Today!'
                  : daysRemaining === 1
                    ? 'Trial Ends Tomorrow!'
                    : `${daysRemaining} Days Left in Trial`}
              </span>
              <span className={`${subtextColor} ml-1 hidden sm:inline`}>
                {isUrgent
                  ? "Add a payment method now to continue using CartHost."
                  : formattedEndDate
                    ? `Your free trial ends on ${formattedEndDate}. Add a payment method to continue after.`
                    : "Add a payment method before your trial ends."}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddPayment}
              disabled={isLoadingPortal}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium ${buttonBg} rounded-lg transition-colors disabled:opacity-70`}
            >
              {isLoadingPortal ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isLoadingPortal ? 'Opening...' : 'Add Payment'}
              </span>
              <span className="sm:hidden">
                {isLoadingPortal ? '...' : 'Add'}
              </span>
            </button>
            <button
              onClick={handleDismiss}
              className={`p-1 ${dismissColor} transition-colors`}
              aria-label="Dismiss"
              title={isWarning ? "Banner will reappear tomorrow" : "Dismiss"}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
