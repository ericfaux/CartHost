import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Admin client to bypass RLS for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return new NextResponse('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  console.log(`Received Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialEnding(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    // Return 200 anyway to prevent Stripe from retrying
    // Log the error for investigation
    return NextResponse.json({ received: true, error: 'Handler failed' });
  }

  return NextResponse.json({ received: true });
}

/**
 * Handle checkout.session.completed - links Stripe customer to user
 * This is the critical handler for new subscriptions from the pricing table
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', {
    sessionId: session.id,
    clientReferenceId: session.client_reference_id,
    customerEmail: session.customer_email,
    customerId: session.customer,
    subscriptionId: session.subscription,
  });

  // client_reference_id is the user ID passed from the pricing table
  const userId = session.client_reference_id;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const customerEmail = session.customer_email;

  if (!userId && !customerEmail) {
    console.error('No client_reference_id or customer_email in checkout session');
    return;
  }

  // Find host by user ID (preferred) or email (fallback)
  let host;
  if (userId) {
    const { data, error } = await supabaseAdmin
      .from('hosts')
      .select('id, email, subscription_status')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to find host by user ID:', userId, error);
    } else {
      host = data;
    }
  }

  // Fallback: find by email if no user ID match
  if (!host && customerEmail) {
    const { data, error } = await supabaseAdmin
      .from('hosts')
      .select('id, email, subscription_status')
      .eq('email', customerEmail)
      .single();

    if (error) {
      console.error('Failed to find host by email:', customerEmail, error);
      return;
    }
    host = data;
  }

  if (!host) {
    console.error('Could not find host for checkout session');
    return;
  }

  // Fetch subscription details to determine status and plan
  let subscriptionStatus = 'active';
  let planVariant = null;

  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      subscriptionStatus = subscription.status; // 'trialing', 'active', etc.

      // Get price ID to determine plan variant
      const priceId = subscription.items.data[0]?.price.id;
      if (priceId) {
        planVariant = priceId;
      }

      console.log('Subscription details:', {
        status: subscriptionStatus,
        priceId,
        trialEnd: subscription.trial_end,
      });
    } catch (err) {
      console.error('Failed to retrieve subscription:', err);
    }
  }

  // Update host record with Stripe customer and subscription info
  const { error: updateError } = await supabaseAdmin
    .from('hosts')
    .update({
      stripe_customer_id: customerId,
      subscription_id: subscriptionId,
      subscription_status: subscriptionStatus,
      plan_variant: planVariant,
    })
    .eq('id', host.id);

  if (updateError) {
    console.error('Failed to update host with Stripe info:', updateError);
    throw updateError;
  }

  console.log(`✅ Host ${host.id} linked to Stripe customer ${customerId}, subscription: ${subscriptionId}, status: ${subscriptionStatus}`);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find host by stripe_customer_id
  const { data: host, error: hostError } = await supabaseAdmin
    .from('hosts')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (hostError || !host) {
    console.error('Host not found for Stripe customer:', customerId, hostError);
    return;
  }

  // Get period dates from subscription items (Stripe SDK v20+)
  const subscriptionItem = subscription.items.data[0];

  // Prepare subscription data
  const subscriptionData = {
    id: subscription.id,
    user_id: host.id,
    status: subscription.status,
    price_id: subscriptionItem?.price.id ?? null,
    quantity: subscriptionItem?.quantity ?? 1,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: subscriptionItem
      ? new Date(subscriptionItem.current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscriptionItem
      ? new Date(subscriptionItem.current_period_end * 1000).toISOString()
      : null,
    created: new Date(subscription.created * 1000).toISOString(),
    ended_at: subscription.ended_at
      ? new Date(subscription.ended_at * 1000).toISOString()
      : null,
    cancel_at: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
  };

  // Upsert subscription data
  const { error: upsertError } = await supabaseAdmin
    .from('subscriptions')
    .upsert(subscriptionData);

  if (upsertError) {
    console.error('Failed to upsert subscription:', upsertError);
    throw upsertError;
  }

  // Also update the host's subscription_status field for quick access checks
  const { error: hostUpdateError } = await supabaseAdmin
    .from('hosts')
    .update({
      subscription_status: subscription.status,
      subscription_id: subscription.id,
      plan_variant: subscriptionItem?.price.id ?? null,
    })
    .eq('id', host.id);

  if (hostUpdateError) {
    console.error('Failed to update host subscription_status:', hostUpdateError);
  }

  console.log(`Subscription ${subscription.id} synced for host ${host.id} (status: ${subscription.status})`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const { data: host } = await supabaseAdmin
    .from('hosts')
    .select('id, email, full_name')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!host) {
    console.error('Host not found for failed payment, customer:', customerId);
    return;
  }

  // Log for now - implement email notification later
  console.log(`⚠️ Payment failed for host ${host.id} (${host.email})`);

  // TODO: Send email notification about failed payment
  // TODO: Create in-app notification
}

async function handleTrialEnding(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { data: host } = await supabaseAdmin
    .from('hosts')
    .select('id, email, full_name')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!host) {
    console.error('Host not found for trial ending, customer:', customerId);
    return;
  }

  const trialEnd = new Date(subscription.trial_end! * 1000);

  // Log for now - implement email notification later
  console.log(`⏰ Trial ending for host ${host.id} (${host.email}) on ${trialEnd.toISOString()}`);

  // TODO: Send email reminder about trial ending in 3 days
}
