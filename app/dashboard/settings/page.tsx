import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import SettingsForm, {
  type HostProfile,
} from "@/components/SettingsForm";
import SubscriptionPricing from "@/components/SubscriptionPricing";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import { isActiveSubscription } from "@/lib/subscriptions";
import SubscriptionAlert from "@/components/SubscriptionAlert";

interface Subscription {
  id: string;
  status: string;
  price_id: string | null;
  current_period_end: string | null;
  current_period_start: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login");
  }

  // Fetch host profile
  const { data: profile, error: profileError } = await supabase
    .from("hosts")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profileError) {
    console.error("Failed to load host profile", profileError);
    throw new Error("Unable to load host profile.");
  }

  // Fetch active subscription (most recent active or trialing)
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, status, price_id, current_period_end, current_period_start, cancel_at_period_end, canceled_at")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing", "past_due"])
    .order("created", { ascending: false })
    .limit(1)
    .single();

  const hasActiveSubscription = isActiveSubscription(subscription?.status) || subscription?.status === 'past_due';

  // Check for Stripe redirect status
  const showSuccess = params.success === 'true';
  const showCanceled = params.canceled === 'true';

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Account Settings
        </h1>
        <p className="text-sm text-ink-subtle">
          Manage your profile and subscription.
        </p>
      </div>

      {/* Stripe Checkout Alerts */}
      {showSuccess && (
        <SubscriptionAlert
          type="success"
          message="Welcome to CartHost! Your subscription is now active."
        />
      )}
      {showCanceled && (
        <SubscriptionAlert
          type="info"
          message="Checkout was canceled. You can subscribe anytime."
        />
      )}

      {/* Subscription Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">Subscription</h2>

        {hasActiveSubscription && subscription ? (
          <SubscriptionStatus
            subscription={subscription as Subscription}
            isBetaUser={profile.is_beta_user}
          />
        ) : (
          <SubscriptionPricing currentPriceId={subscription?.price_id} />
        )}
      </section>

      {/* Profile Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">Profile</h2>
        <SettingsForm profile={profile as HostProfile} />
      </section>
    </div>
  );
}
