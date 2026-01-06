import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { TourProvider } from "./tour-context";
import GlobalTourOverlay from "../../components/GlobalTourOverlay";
import TrialBanner from "../../components/TrialBanner";
import PastDueBanner from "../../components/PastDueBanner";
import { getTrialDaysRemaining } from "@/lib/subscriptions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            // Ignore set errors during server rendering when cookies cannot be set
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check subscription status for dashboard access
  const { data: host } = await supabase
    .from("hosts")
    .select("subscription_status, subscription_id, is_beta_user")
    .eq("id", user.id)
    .single();

  // Redirect to subscribe page if user doesn't have valid subscription
  // Valid statuses: trialing, active, past_due (allow grace period)
  // Beta users always have access
  const validStatuses = ["trialing", "active", "past_due"];
  const hasValidSubscription =
    host?.is_beta_user || (host?.subscription_status && validStatuses.includes(host.subscription_status));

  if (!hasValidSubscription) {
    redirect("/subscribe");
  }

  // Fetch subscription details for trial banner
  let trialDaysRemaining: number | null = null;
  let trialEndDate: Date | undefined;

  if (host?.subscription_status === "trialing" && host?.subscription_id) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("current_period_end, trial_end")
      .eq("id", host.subscription_id)
      .single();

    if (subscription) {
      const endDateStr = subscription.trial_end || subscription.current_period_end;
      if (endDateStr) {
        trialDaysRemaining = getTrialDaysRemaining(endDateStr);
        trialEndDate = new Date(endDateStr);
      }
    }
  }

  // Determine which banner to show
  const showPastDueBanner = host?.subscription_status === "past_due";
  const showTrialBanner = host?.subscription_status === "trialing" && trialDaysRemaining !== null;

  // Fetch the latest rental ID for the tour's "Evidence Packet" step
  const { data: latestRental } = await supabase
    .from("rentals")
    .select("id, carts!inner(host_id)")
    .eq("carts.host_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const latestRentalId = latestRental?.id ?? null;

  return (
    <TourProvider latestRentalId={latestRentalId}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto dossier-paper">
          {showPastDueBanner && <PastDueBanner />}
          {showTrialBanner && !showPastDueBanner && (
            <TrialBanner
              daysRemaining={trialDaysRemaining!}
              trialEndDate={trialEndDate}
            />
          )}
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        <GlobalTourOverlay />
      </div>
    </TourProvider>
  );
}
