import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

/**
 * Supported portal flow types for deep linking
 */
type PortalFlow =
  | 'payment_method_update'
  | 'subscription_cancel'
  | 'subscription_update'
  | 'subscription_update_confirm'
  | 'invoice_history';

interface CreatePortalRequest {
  flow?: PortalFlow;
  subscriptionId?: string;
  returnUrl?: string;
}

/**
 * POST /api/stripe/create-portal
 *
 * Creates a Stripe Customer Portal session with optional deep linking.
 *
 * Request body (all optional):
 * - flow: The specific portal flow to open
 *   - 'payment_method_update': Update payment method
 *   - 'subscription_cancel': Cancel subscription
 *   - 'subscription_update': Change subscription plan
 *   - 'invoice_history': View invoices
 * - subscriptionId: Required for subscription_cancel, subscription_update flows
 * - returnUrl: Custom return URL (defaults to /dashboard/settings)
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    let body: CreatePortalRequest = {};
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      // Empty body is fine
    }

    const { flow, subscriptionId, returnUrl } = body;

    // Get user's Stripe customer ID from hosts table
    const { data: profile, error: profileError } = await supabase
      .from('hosts')
      .select('stripe_customer_id, subscription_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Failed to fetch profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please subscribe first.' },
        { status: 400 }
      );
    }

    const baseReturnUrl = returnUrl || `${process.env.NEXT_PUBLIC_URL}/dashboard/settings`;

    // Build portal session configuration
    const portalConfig: Stripe.BillingPortal.SessionCreateParams = {
      customer: profile.stripe_customer_id,
      return_url: baseReturnUrl,
    };

    // Add flow configuration for deep linking
    if (flow) {
      const effectiveSubscriptionId = subscriptionId || profile.subscription_id;

      switch (flow) {
        case 'payment_method_update':
          portalConfig.flow_data = {
            type: 'payment_method_update',
          };
          break;

        case 'subscription_cancel':
          if (!effectiveSubscriptionId) {
            return NextResponse.json(
              { error: 'No subscription found to cancel' },
              { status: 400 }
            );
          }
          portalConfig.flow_data = {
            type: 'subscription_cancel',
            subscription_cancel: {
              subscription: effectiveSubscriptionId,
            },
          };
          break;

        case 'subscription_update':
          if (!effectiveSubscriptionId) {
            return NextResponse.json(
              { error: 'No subscription found to update' },
              { status: 400 }
            );
          }
          portalConfig.flow_data = {
            type: 'subscription_update',
            subscription_update: {
              subscription: effectiveSubscriptionId,
            },
          };
          break;

        case 'subscription_update_confirm':
          if (!effectiveSubscriptionId) {
            return NextResponse.json(
              { error: 'No subscription found to update' },
              { status: 400 }
            );
          }
          portalConfig.flow_data = {
            type: 'subscription_update_confirm',
            subscription_update_confirm: {
              subscription: effectiveSubscriptionId,
              items: [], // Will show current items by default
            },
          };
          break;

        // Note: invoice_history is not a supported flow_data type
        // Users will see invoice history on the main portal page
      }
    }

    // Create Stripe Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create(portalConfig);

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal error:', error);

    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
