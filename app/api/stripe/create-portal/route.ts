import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's Stripe customer ID from hosts table
    const { data: profile, error: profileError } = await supabase
      .from('hosts')
      .select('stripe_customer_id')
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

    // Create Stripe Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
