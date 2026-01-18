import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Sparkles, ShieldCheck, Clock } from "lucide-react";

import SubscriptionPricing from "@/components/SubscriptionPricing";
import { Logo } from "@/components/ui/Logo";
import { signOut } from "@/app/auth/actions";
import SubscriptionSyncCheck from "@/components/SubscriptionSyncCheck";

export default async function SubscribePage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore cookie write failures during SSR
          }
        },
      },
    }
  );

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    redirect("/login");
  }

  // Fetch user's host profile to check subscription status
  const { data: profile } = await supabase
    .from("hosts")
    .select("id, email, subscription_status, is_beta_user, stripe_customer_id")
    .eq("id", user.id)
    .single();

  // Redirect to dashboard if user already has an active subscription
  const activeStatuses = ["trialing", "active", "past_due"];
  if (
    profile?.is_beta_user ||
    (profile?.subscription_status && activeStatuses.includes(profile.subscription_status))
  ) {
    redirect("/dashboard");
  }

  // Determine messaging based on subscription status
  const isPending = profile?.subscription_status === "pending";
  const isCanceled = profile?.subscription_status === "canceled";
  const isReturningUser = isPending && !profile?.stripe_customer_id;

  return (
    <main className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="text-xl" />
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-ink-subtle hover:text-ink transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Hero Section - narrower for readability */}
      <div className="mx-auto max-w-3xl px-4 pt-12 pb-8">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-ops/20 bg-accent-ops/5 px-4 py-2 text-sm font-medium text-accent-ops">
            <Sparkles className="h-4 w-4" />
            {isCanceled ? "Reactivate Your Account" : "Start Your 30-Day Free Trial"}
          </div>

          <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight text-ink md:text-5xl">
            {isReturningUser
              ? "Continue Setting Up Your Account"
              : isCanceled
                ? "We'd Love to Have You Back"
                : "Choose Your Plan"}
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-ink-subtle">
            {isReturningUser
              ? "You're almost there! Select a plan to activate your account and start managing your fleet."
              : isCanceled
                ? "Select a plan below to restore access to your dashboard and continue managing your rentals."
                : "Protect your rentals, streamline operations, and grow your business. No credit card required to start."}
          </p>

          {/* User Email Display */}
          <p className="mt-4 text-sm text-ink-muted">
            Signed in as <span className="font-medium text-ink">{user.email}</span>
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-ink-subtle">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent-ops" />
            <span>30-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent-ops" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-ops" />
            <span>No setup fees</span>
          </div>
        </div>
      </div>

      {/* Pricing Table Section - wider to allow horizontal layout */}
      <div className="w-full max-w-6xl mx-auto px-4 pb-12">
        <div className="rounded-dossier-surface border border-rule bg-surface p-4 shadow-dossier-surface md:p-6">
          <SubscriptionPricing />
        </div>

        {/* Sync Check for eventual consistency */}
        {profile?.stripe_customer_id && (
          <div className="mt-6">
            <SubscriptionSyncCheck
              currentStatus={profile.subscription_status}
              hasStripeCustomer={!!profile.stripe_customer_id}
            />
          </div>
        )}
      </div>

      {/* FAQ / Help Links */}
      <div className="pb-8 text-center">
        <p className="text-sm text-ink-muted">
          Questions?{" "}
          <a
            href="mailto:support@carthost.com"
            className="font-medium text-accent-ops hover:text-accent-ops-light transition-colors"
          >
            Contact our team
          </a>
        </p>
      </div>
    </main>
  );
}
