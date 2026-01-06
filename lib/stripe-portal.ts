/**
 * Stripe Customer Portal Helpers
 *
 * Client-side utilities for opening the Stripe Customer Portal
 * with optional deep linking to specific flows.
 */

export type PortalFlow =
  | 'payment_method_update'
  | 'subscription_cancel'
  | 'subscription_update'
  | 'invoice_history';

interface PortalOptions {
  flow?: PortalFlow;
  subscriptionId?: string;
  returnUrl?: string;
}

interface PortalResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Open the Stripe Customer Portal
 *
 * @param options - Optional configuration for deep linking
 * @returns Promise with the portal URL or error
 *
 * @example
 * // Open general portal
 * await openPortal();
 *
 * @example
 * // Open directly to payment method update
 * await openPortal({ flow: 'payment_method_update' });
 *
 * @example
 * // Open to cancel subscription
 * await openPortal({ flow: 'subscription_cancel', subscriptionId: 'sub_xxx' });
 */
export async function openPortal(options?: PortalOptions): Promise<PortalResult> {
  try {
    const response = await fetch('/api/stripe/create-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: options ? JSON.stringify(options) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to create portal session',
      };
    }

    if (data.url) {
      // Navigate to portal
      window.location.href = data.url;
      return { success: true, url: data.url };
    }

    return {
      success: false,
      error: 'No portal URL returned',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to open portal',
    };
  }
}

/**
 * Open portal to update payment method
 */
export function openPaymentMethodUpdate(): Promise<PortalResult> {
  return openPortal({ flow: 'payment_method_update' });
}

/**
 * Open portal to cancel subscription
 */
export function openCancelSubscription(subscriptionId?: string): Promise<PortalResult> {
  return openPortal({
    flow: 'subscription_cancel',
    subscriptionId,
  });
}

/**
 * Open portal to change subscription plan
 */
export function openChangePlan(subscriptionId?: string): Promise<PortalResult> {
  return openPortal({
    flow: 'subscription_update',
    subscriptionId,
  });
}

/**
 * Open portal to view invoices
 * Note: This opens the main portal which includes invoice history
 */
export function openInvoiceHistory(): Promise<PortalResult> {
  return openPortal();
}
