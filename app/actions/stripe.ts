'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function createCheckoutSession(priceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get host profile with Stripe customer ID
  const { data: profile } = await supabase
    .from('hosts')
    .select('stripe_customer_id, email, full_name')
    .eq('id', user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  // Verify existing customer exists in Stripe, or create a new one
  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId);
    } catch (error) {
      // Customer doesn't exist in Stripe (deleted or wrong environment)
      console.warn(`Stripe customer ${customerId} not found, creating new one`);
      customerId = null;
    }
  }

  // Create Stripe customer if doesn't exist or was invalid
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_id: user.id },
    });
    customerId = customer.id;

    // Save customer ID to database
    await supabase
      .from('hosts')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id);
  }

  // Determine trial eligibility
  const isBeta = priceId === process.env.NEXT_PUBLIC_PRICE_BETA;

  // Check if user has had a subscription before (no trial for returning users)
  const { data: existingSubs } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  const hasHadSubscription = (existingSubs?.length ?? 0) > 0;

  // Beta users get no trial (it's free), returning users get no trial
  const subscriptionData: Stripe.Checkout.SessionCreateParams['subscription_data'] = {
    metadata: { supabase_id: user.id },
    ...((!isBeta && !hasHadSubscription) && { trial_period_days: 30 }),
  };

  // Get origin for redirect URLs
  const headersList = await headers();
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_URL;

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: subscriptionData,
    metadata: { supabase_id: user.id },
    success_url: `${origin}/dashboard/settings?success=true`,
    cancel_url: `${origin}/dashboard/settings?canceled=true`,
    allow_promotion_codes: true,
  });

  redirect(session.url!);
}

export async function createPortalSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('hosts')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    // No Stripe customer yet, redirect to settings to subscribe
    redirect('/dashboard/settings');
  }

  // Verify customer exists in Stripe
  try {
    await stripe.customers.retrieve(profile.stripe_customer_id);
  } catch {
    // Customer doesn't exist, redirect to subscribe
    redirect('/subscribe');
  }

  const headersList = await headers();
  const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_URL;

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/dashboard/settings`,
  });

  redirect(session.url);
}
