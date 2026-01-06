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

/**
 * Structured logging for webhook events
 * Makes it easier to search logs in production
 */
function logWebhook(
  level: 'info' | 'warn' | 'error',
  eventId: string,
  eventType: string,
  message: string,
  data?: Record<string, unknown>
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    service: 'stripe-webhook',
    eventId,
    eventType,
    message,
    ...data,
  };

  switch (level) {
    case 'error':
      console.error(JSON.stringify(logEntry));
      break;
    case 'warn':
      console.warn(JSON.stringify(logEntry));
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
}

/**
 * Check if we've already processed this event (idempotency)
 * Returns true if event was already processed, false if new
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .single();

  return !!data;
}

/**
 * Mark event as processed for idempotency
 */
async function markEventProcessed(
  eventId: string,
  eventType: string,
  status: 'success' | 'failed' | 'skipped',
  errorMessage?: string
): Promise<void> {
  await supabaseAdmin.from('webhook_events').upsert({
    stripe_event_id: eventId,
    event_type: eventType,
    status,
    error_message: errorMessage ?? null,
    processed_at: new Date().toISOString(),
  });
}

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

  logWebhook('info', event.id, event.type, 'Received webhook event');

  // Check idempotency - skip if already processed
  // We wrap this in try/catch because the webhook_events table might not exist
  // in development, and we don't want to fail the webhook for that reason
  try {
    const alreadyProcessed = await isEventProcessed(event.id);
    if (alreadyProcessed) {
      logWebhook('info', event.id, event.type, 'Event already processed, skipping');
      return NextResponse.json({ received: true, status: 'duplicate' });
    }
  } catch {
    // Table might not exist, continue processing
    logWebhook('warn', event.id, event.type, 'Could not check idempotency, proceeding anyway');
  }

  let processingStatus: 'success' | 'failed' | 'skipped' = 'success';
  let errorMessage: string | undefined;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event);
        break;

      case 'checkout.session.expired':
        await handleCheckoutExpired(event);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialEnding(event);
        break;

      case 'invoice.upcoming':
        // Log for monitoring, no action needed
        logWebhook('info', event.id, event.type, 'Upcoming invoice notification');
        break;

      default:
        logWebhook('info', event.id, event.type, 'Unhandled event type, skipping');
        processingStatus = 'skipped';
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Unknown handler error';
    logWebhook('error', event.id, event.type, 'Webhook handler error', { error: errorMessage });
    processingStatus = 'failed';
    // Return 200 anyway to prevent Stripe from retrying
    // The error is logged for investigation
  }

  // Record the event processing (for idempotency)
  try {
    await markEventProcessed(event.id, event.type, processingStatus, errorMessage);
  } catch {
    // Don't fail if we can't record the event
    logWebhook('warn', event.id, event.type, 'Failed to record event processing');
  }

  return NextResponse.json({
    received: true,
    status: processingStatus,
    ...(errorMessage && { error: 'Handler failed - see logs' }),
  });
}

/**
 * Handle checkout.session.completed - links Stripe customer to user
 * This is the critical handler for new subscriptions from the pricing table
 */
async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  logWebhook('info', event.id, event.type, 'Processing checkout completion', {
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
    logWebhook('warn', event.id, event.type, 'No client_reference_id or customer_email in checkout session');
    return;
  }

  // Find host by user ID (preferred) or email (fallback)
  const host = await findHost(userId, customerEmail);

  if (!host) {
    logWebhook('error', event.id, event.type, 'Could not find host for checkout session', {
      userId,
      customerEmail,
    });
    // Don't throw - this might be a non-CartHost checkout
    return;
  }

  // Fetch subscription details to determine status and plan
  let subscriptionStatus = 'active';
  let planVariant = null;
  let currentPeriodEnd: Date | null = null;

  if (subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      subscriptionStatus = subscription.status;

      // Get price ID to determine plan variant
      const subscriptionItem = subscription.items.data[0];
      if (subscriptionItem?.price.id) {
        planVariant = subscriptionItem.price.id;
      }

      // Get period end for trial info
      if (subscriptionItem?.current_period_end) {
        currentPeriodEnd = new Date(subscriptionItem.current_period_end * 1000);
      }

      logWebhook('info', event.id, event.type, 'Subscription details retrieved', {
        status: subscriptionStatus,
        priceId: planVariant,
        trialEnd: subscription.trial_end,
        currentPeriodEnd: currentPeriodEnd?.toISOString(),
      });
    } catch (err) {
      logWebhook('error', event.id, event.type, 'Failed to retrieve subscription', {
        subscriptionId,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
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
    logWebhook('error', event.id, event.type, 'Failed to update host with Stripe info', {
      hostId: host.id,
      error: updateError.message,
    });
    throw updateError;
  }

  logWebhook('info', event.id, event.type, 'Host linked to Stripe customer', {
    hostId: host.id,
    customerId,
    subscriptionId,
    status: subscriptionStatus,
  });
}

/**
 * Handle checkout.session.expired - user abandoned checkout
 * Useful for analytics and follow-up
 */
async function handleCheckoutExpired(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  logWebhook('info', event.id, event.type, 'Checkout session expired (abandoned)', {
    sessionId: session.id,
    clientReferenceId: session.client_reference_id,
    customerEmail: session.customer_email,
  });

  // Could trigger abandoned cart email here
  // For now just log for analytics
}

/**
 * Handle subscription created/updated events
 * Uses upsert for idempotent handling of out-of-order events
 */
async function handleSubscriptionChange(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  // Find host by stripe_customer_id
  const { data: host, error: hostError } = await supabaseAdmin
    .from('hosts')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (hostError || !host) {
    // This is common during initial setup - the checkout.session.completed
    // event may arrive before we've linked the customer
    logWebhook('warn', event.id, event.type, 'Host not found for Stripe customer', {
      customerId,
      subscriptionId: subscription.id,
    });

    // Try to find by metadata if available
    const userId = subscription.metadata?.supabase_id;
    if (userId) {
      const { data: hostByMeta } = await supabaseAdmin
        .from('hosts')
        .select('id, email')
        .eq('id', userId)
        .single();

      if (hostByMeta) {
        logWebhook('info', event.id, event.type, 'Found host by metadata, linking customer', {
          hostId: hostByMeta.id,
          customerId,
        });

        // Link the customer ID
        await supabaseAdmin
          .from('hosts')
          .update({ stripe_customer_id: customerId })
          .eq('id', hostByMeta.id);

        // Continue processing with this host
        await processSubscriptionUpdate(event, subscription, hostByMeta.id);
        return;
      }
    }

    return;
  }

  await processSubscriptionUpdate(event, subscription, host.id);
}

async function processSubscriptionUpdate(
  event: Stripe.Event,
  subscription: Stripe.Subscription,
  hostId: string
) {
  // Get period dates from subscription items
  const subscriptionItem = subscription.items.data[0];

  // Prepare subscription data with all fields for upsert
  const subscriptionData = {
    id: subscription.id,
    user_id: hostId,
    status: subscription.status,
    price_id: subscriptionItem?.price.id ?? null,
    quantity: subscriptionItem?.quantity ?? 1,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: subscriptionItem?.current_period_start
      ? new Date(subscriptionItem.current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscriptionItem?.current_period_end
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
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  };

  // Upsert subscription data (idempotent)
  const { error: upsertError } = await supabaseAdmin
    .from('subscriptions')
    .upsert(subscriptionData);

  if (upsertError) {
    logWebhook('error', event.id, event.type, 'Failed to upsert subscription', {
      subscriptionId: subscription.id,
      error: upsertError.message,
    });
    throw upsertError;
  }

  // Update host's subscription status for quick access checks
  // Only update if this subscription is newer than what's stored
  const { error: hostUpdateError } = await supabaseAdmin
    .from('hosts')
    .update({
      subscription_status: subscription.status,
      subscription_id: subscription.id,
      plan_variant: subscriptionItem?.price.id ?? null,
    })
    .eq('id', hostId);

  if (hostUpdateError) {
    logWebhook('error', event.id, event.type, 'Failed to update host subscription_status', {
      hostId,
      error: hostUpdateError.message,
    });
  }

  logWebhook('info', event.id, event.type, 'Subscription synced', {
    subscriptionId: subscription.id,
    hostId,
    status: subscription.status,
    priceId: subscriptionItem?.price.id,
  });
}

/**
 * Handle subscription deleted - explicit cancellation
 */
async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  const { data: host } = await supabaseAdmin
    .from('hosts')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!host) {
    logWebhook('warn', event.id, event.type, 'Host not found for subscription deletion', {
      customerId,
      subscriptionId: subscription.id,
    });
    return;
  }

  // Update subscription record
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      ended_at: new Date().toISOString(),
    })
    .eq('id', subscription.id);

  // Update host status to 'canceled'
  await supabaseAdmin
    .from('hosts')
    .update({
      subscription_status: 'canceled',
    })
    .eq('id', host.id);

  logWebhook('info', event.id, event.type, 'Subscription canceled', {
    subscriptionId: subscription.id,
    hostId: host.id,
  });
}

/**
 * Handle payment failed - update status and prepare for notification
 */
async function handlePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string | null;

  const { data: host } = await supabaseAdmin
    .from('hosts')
    .select('id, email, full_name')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!host) {
    logWebhook('warn', event.id, event.type, 'Host not found for failed payment', {
      customerId,
      invoiceId: invoice.id,
    });
    return;
  }

  // Update subscription status to past_due if this is a subscription invoice
  if (subscriptionId) {
    await supabaseAdmin
      .from('hosts')
      .update({ subscription_status: 'past_due' })
      .eq('id', host.id);

    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('id', subscriptionId);
  }

  logWebhook('warn', event.id, event.type, 'Payment failed', {
    hostId: host.id,
    email: host.email,
    invoiceId: invoice.id,
    amountDue: invoice.amount_due,
  });

  // TODO: Send email notification about failed payment
  // TODO: Create in-app notification
}

/**
 * Handle payment succeeded - restore subscription if was past_due
 */
async function handlePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string | null;

  if (!subscriptionId) {
    // One-time payment, not subscription related
    return;
  }

  const { data: host } = await supabaseAdmin
    .from('hosts')
    .select('id, subscription_status')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!host) {
    logWebhook('warn', event.id, event.type, 'Host not found for successful payment', {
      customerId,
      invoiceId: invoice.id,
    });
    return;
  }

  // If was past_due, update to active
  if (host.subscription_status === 'past_due') {
    await supabaseAdmin
      .from('hosts')
      .update({ subscription_status: 'active' })
      .eq('id', host.id);

    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('id', subscriptionId);

    logWebhook('info', event.id, event.type, 'Subscription restored from past_due', {
      hostId: host.id,
      subscriptionId,
    });
  }
}

/**
 * Handle trial ending - send reminder
 */
async function handleTrialEnding(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer as string;

  const { data: host } = await supabaseAdmin
    .from('hosts')
    .select('id, email, full_name')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!host) {
    logWebhook('warn', event.id, event.type, 'Host not found for trial ending', {
      customerId,
      subscriptionId: subscription.id,
    });
    return;
  }

  const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

  logWebhook('info', event.id, event.type, 'Trial ending soon', {
    hostId: host.id,
    email: host.email,
    trialEnd: trialEnd?.toISOString(),
    daysRemaining: trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null,
  });

  // TODO: Send email reminder about trial ending in 3 days
}

/**
 * Find host by user ID or email
 */
async function findHost(
  userId: string | null | undefined,
  email: string | null | undefined
): Promise<{ id: string; email: string | null } | null> {
  // Try by user ID first
  if (userId) {
    const { data, error } = await supabaseAdmin
      .from('hosts')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (!error && data) {
      return data;
    }
  }

  // Fallback to email
  if (email) {
    const { data, error } = await supabaseAdmin
      .from('hosts')
      .select('id, email')
      .eq('email', email)
      .single();

    if (!error && data) {
      return data;
    }
  }

  return null;
}
