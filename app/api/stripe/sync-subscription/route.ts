import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Admin client for when we need to bypass RLS
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SyncResult {
  synced: boolean;
  subscription?: {
    id: string;
    status: string;
    priceId: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    trialEnd: string | null;
  };
  host?: {
    subscriptionStatus: string | null;
    planVariant: string | null;
  };
  changes?: string[];
  error?: string;
}

/**
 * POST /api/stripe/sync-subscription
 *
 * Manually sync subscription status from Stripe.
 * Useful for debugging or recovering from missed webhooks.
 *
 * Can be called by:
 * - Authenticated user (syncs their own subscription)
 * - Admin (can sync any user with ?userId=xxx query param)
 */
export async function POST(req: Request): Promise<NextResponse<SyncResult>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { synced: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse optional query param for admin override
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    // Determine which user to sync
    let syncUserId = user.id;

    // If targeting a different user, check if current user is admin
    if (targetUserId && targetUserId !== user.id) {
      const { data: currentProfile } = await supabase
        .from('hosts')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!currentProfile?.is_admin) {
        return NextResponse.json(
          { synced: false, error: 'Forbidden: Admin access required to sync other users' },
          { status: 403 }
        );
      }

      syncUserId = targetUserId;
    }

    // Get host profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('hosts')
      .select('id, stripe_customer_id, subscription_id, subscription_status, plan_variant')
      .eq('id', syncUserId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { synced: false, error: 'Host profile not found' },
        { status: 404 }
      );
    }

    // If no Stripe customer, nothing to sync
    if (!profile.stripe_customer_id) {
      return NextResponse.json({
        synced: false,
        error: 'No Stripe customer linked to this account',
        host: {
          subscriptionStatus: profile.subscription_status,
          planVariant: profile.plan_variant,
        },
      });
    }

    // Fetch the latest subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    const changes: string[] = [];

    if (subscriptions.data.length === 0) {
      // No subscription found - may have been fully deleted
      if (profile.subscription_status && profile.subscription_status !== 'none' && profile.subscription_status !== 'canceled') {
        // Update to reflect no subscription
        await supabaseAdmin
          .from('hosts')
          .update({
            subscription_status: 'canceled',
            subscription_id: null,
            plan_variant: null,
          })
          .eq('id', syncUserId);

        changes.push('Subscription marked as canceled (not found in Stripe)');
      }

      return NextResponse.json({
        synced: true,
        host: {
          subscriptionStatus: 'canceled',
          planVariant: null,
        },
        changes,
      });
    }

    const stripeSubscription = subscriptions.data[0];
    const subscriptionItem = stripeSubscription.items.data[0];

    // Build subscription data
    const subscriptionData = {
      id: stripeSubscription.id,
      user_id: syncUserId,
      status: stripeSubscription.status,
      price_id: subscriptionItem?.price.id ?? null,
      quantity: subscriptionItem?.quantity ?? 1,
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      current_period_start: subscriptionItem?.current_period_start
        ? new Date(subscriptionItem.current_period_start * 1000).toISOString()
        : null,
      current_period_end: subscriptionItem?.current_period_end
        ? new Date(subscriptionItem.current_period_end * 1000).toISOString()
        : null,
      created: new Date(stripeSubscription.created * 1000).toISOString(),
      ended_at: stripeSubscription.ended_at
        ? new Date(stripeSubscription.ended_at * 1000).toISOString()
        : null,
      cancel_at: stripeSubscription.cancel_at
        ? new Date(stripeSubscription.cancel_at * 1000).toISOString()
        : null,
      canceled_at: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
        : null,
      trial_start: stripeSubscription.trial_start
        ? new Date(stripeSubscription.trial_start * 1000).toISOString()
        : null,
      trial_end: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000).toISOString()
        : null,
    };

    // Upsert subscription record
    const { error: upsertError } = await supabaseAdmin
      .from('subscriptions')
      .upsert(subscriptionData);

    if (upsertError) {
      console.error('Failed to upsert subscription:', upsertError);
      throw new Error(`Failed to update subscription record: ${upsertError.message}`);
    }

    changes.push('Subscription record synced');

    // Check for host updates
    const hostUpdates: Record<string, unknown> = {};

    if (profile.subscription_status !== stripeSubscription.status) {
      hostUpdates.subscription_status = stripeSubscription.status;
      changes.push(`Status: ${profile.subscription_status} → ${stripeSubscription.status}`);
    }

    if (profile.subscription_id !== stripeSubscription.id) {
      hostUpdates.subscription_id = stripeSubscription.id;
      changes.push(`Subscription ID updated`);
    }

    if (profile.plan_variant !== subscriptionItem?.price.id) {
      hostUpdates.plan_variant = subscriptionItem?.price.id ?? null;
      changes.push(`Plan: ${profile.plan_variant} → ${subscriptionItem?.price.id}`);
    }

    // Update host if needed
    if (Object.keys(hostUpdates).length > 0) {
      const { error: hostUpdateError } = await supabaseAdmin
        .from('hosts')
        .update(hostUpdates)
        .eq('id', syncUserId);

      if (hostUpdateError) {
        console.error('Failed to update host:', hostUpdateError);
        throw new Error(`Failed to update host record: ${hostUpdateError.message}`);
      }
    }

    return NextResponse.json({
      synced: true,
      subscription: {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        priceId: subscriptionItem?.price.id ?? null,
        currentPeriodEnd: subscriptionItem?.current_period_end
          ? new Date(subscriptionItem.current_period_end * 1000).toISOString()
          : null,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        trialEnd: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000).toISOString()
          : null,
      },
      host: {
        subscriptionStatus: stripeSubscription.status,
        planVariant: subscriptionItem?.price.id ?? null,
      },
      changes,
    });
  } catch (error) {
    console.error('Subscription sync error:', error);
    return NextResponse.json(
      {
        synced: false,
        error: error instanceof Error ? error.message : 'Failed to sync subscription',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/sync-subscription
 *
 * Get current subscription status without syncing from Stripe.
 * Useful for checking local state.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get host profile
    const { data: profile, error: profileError } = await supabase
      .from('hosts')
      .select('id, stripe_customer_id, subscription_status, subscription_id, plan_variant, is_beta_user')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Host profile not found' },
        { status: 404 }
      );
    }

    // Get subscription details if exists
    let subscription = null;
    if (profile.subscription_id) {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', profile.subscription_id)
        .single();

      subscription = data;
    }

    return NextResponse.json({
      host: {
        subscriptionStatus: profile.subscription_status,
        subscriptionId: profile.subscription_id,
        planVariant: profile.plan_variant,
        isBetaUser: profile.is_beta_user,
        hasStripeCustomer: !!profile.stripe_customer_id,
      },
      subscription,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get subscription' },
      { status: 500 }
    );
  }
}
