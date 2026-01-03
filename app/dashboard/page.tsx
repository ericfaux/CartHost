import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CarFront, History, Wrench, Activity } from "lucide-react";
import OnboardingWidget from "../../components/OnboardingWidget";
import FinancialSection from "../../components/FinancialSection";
import ProtectionOverview from "../../components/ProtectionOverview";
import DashboardDateFilter from "../../components/DashboardDateFilter";
import { PageHeader, SectionHeader } from "../../components/ui/Panel";
import { Badge, StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { HealthIndicator } from "../../components/ui/Meters";
import type { DashboardPeriod } from "../../components/DashboardCharts";

const GREEN = "healthy" as const;
const YELLOW = "dueSoon" as const;
const RED = "overdue" as const;
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type Cart = {
  id: string;
  name: string;
  last_serviced_at?: string | null;
};

type Rental = {
  id: string;
  cart_id: string;
  created_at: string;
  status?: string | null;
  closure_source?: string | null;
  photos?: string[] | null;
  revenue: number | null;
  deposit_status: string | null;
  deposit_amount: number | null;
};

type ServiceLog = {
  cost: number | null;
};

type CartHealth = {
  cart: Cart;
  status: typeof GREEN | typeof YELLOW | typeof RED;
  tripsSinceService: number;
  daysSinceService: number | null;
  reason: string;
};

function calculateHealth(
  carts: Cart[],
  rentals: Rental[],
  today: Date
): CartHealth[] {
  return carts.map((cart) => {
    const lastServiced = cart.last_serviced_at
      ? new Date(cart.last_serviced_at)
      : null;

    const daysSinceService = lastServiced
      ? Math.floor((today.getTime() - lastServiced.getTime()) / 86_400_000)
      : null;

    const cartRentals = rentals.filter((rental) => rental.cart_id === cart.id);
    const tripsSinceService = lastServiced
      ? cartRentals.filter(
          (rental) => new Date(rental.created_at) > lastServiced
        ).length
      : cartRentals.length;

    let status: CartHealth["status"] = GREEN;
    let reason = "";

    if (!lastServiced) {
      status = RED;
      reason = "No service record";
    } else if (tripsSinceService >= 30 || (daysSinceService ?? 0) >= 365) {
      status = RED;
      reason = tripsSinceService >= 30 ? `${tripsSinceService} trips` : `${daysSinceService} days`;
    } else if (tripsSinceService >= 20 || (daysSinceService ?? 0) >= 330) {
      status = YELLOW;
      reason = tripsSinceService >= 20 ? `${tripsSinceService} trips` : `${daysSinceService} days`;
    } else {
      reason = tripsSinceService > 0 ? `${tripsSinceService} trips` : `${daysSinceService ?? 0} days`;
    }

    return {
      cart,
      status,
      tripsSinceService,
      daysSinceService,
      reason,
    };
  });
}

function getPeriod(searchParams: {
  [key: string]: string | string[] | undefined;
}): DashboardPeriod {
  const period = searchParams.period;
  return typeof period === "string" && ["30d", "90d", "ytd"].includes(period)
    ? (period as DashboardPeriod)
    : "30d";
}

function getPeriodStartDate(period: DashboardPeriod) {
  const today = new Date();

  if (period === "90d") {
    const start = new Date(today);
    start.setDate(start.getDate() - 90);
    return start;
  }

  if (period === "ytd") {
    return new Date(today.getFullYear(), 0, 1);
  }

  const start = new Date(today);
  start.setDate(start.getDate() - 30);
  return start;
}

export default async function DashboardHome(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();

  const period = getPeriod(searchParams);

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
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login");
  }

  const { data: carts, error: cartsError } = await supabase
    .from("carts")
    .select("id, name, last_serviced_at")
    .eq("host_id", user.id)
    .order("name");

  const { data: profile, error: profileError } = await supabase
    .from("hosts")
    .select("show_financial_tiles, phone_number, full_name")
    .eq("id", user.id)
    .single();

  const { data: rentals, error: rentalsError } = await supabase
    .from("rentals")
    .select(
      "id, cart_id, created_at, status, closure_source, photos, revenue, deposit_status, deposit_amount, carts!inner(host_id)"
    )
    .eq("carts.host_id", user.id);

  const { data: serviceLogs, error: logsError } = await supabase
    .from("service_logs")
    .select("cost")
    .eq("host_id", user.id);

  if (cartsError || rentalsError || logsError || profileError) {
    console.error(
      "Data fetch failed:",
      cartsError,
      rentalsError,
      logsError,
      profileError
    );
    redirect("/login");
  }

  const finalCarts = carts || [];
  const finalRentals = rentals || [];
  const finalLogs = serviceLogs || [];

  const typedCarts = finalCarts as Cart[];
  const typedRentals = finalRentals as Rental[];
  const typedServiceLogs = finalLogs as ServiceLog[];

  const totalDepositsHeld = typedRentals.reduce((sum, rental) => {
    return rental.deposit_status === "collected"
      ? sum + (rental.deposit_amount ?? 0)
      : sum;
  }, 0);

  const totalRevenue = typedRentals.reduce(
    (sum, rental) => sum + Number(rental.revenue ?? 0),
    0
  );
  const totalExpenses = typedServiceLogs.reduce(
    (sum, log) => sum + Number(log.cost ?? 0),
    0
  );
  const netProfit = totalRevenue - totalExpenses;
  const formatCurrency = (value: number) => currencyFormatter.format(value);

  const today = new Date();
  const periodStartDate = getPeriodStartDate(period);

  const totalRides = typedRentals.length;
  const avgRevenuePerRide = totalRides > 0 ? totalRevenue / totalRides : 0;
  const health = calculateHealth(finalCarts as Cart[], typedRentals, today);

  const recentRentals = typedRentals.filter((r) => {
    const rentalDate = new Date(r.created_at);
    return rentalDate >= periodStartDate && rentalDate <= today;
  });

  const recentCompleted = recentRentals.filter(
    (r) => r.status === "completed"
  );

  const protectedCount = recentRentals.length;

  const activeCount = typedRentals.filter((r) => r.status === "active").length;
  const reviewCount = typedRentals.filter(
    (r) => r.status === "needs_review"
  ).length;

  const manualCount = recentCompleted.filter(
    (r) => r.closure_source === "host"
  ).length;

  const documentedTotal = recentCompleted.length;
  const documentedGuest = recentCompleted.filter(
    (r) => r.closure_source !== "host"
  ).length;

  const documentedRate =
    documentedTotal > 0
      ? Math.round((documentedGuest / documentedTotal) * 100)
      : 0;

  const healthyCount = health.filter((item) => item.status === GREEN).length;
  const dueSoonCount = health.filter((item) => item.status === YELLOW).length;
  const overdueCount = health.filter((item) => item.status === RED).length;

  const attentionList = health.filter(
    (item) => item.status === YELLOW || item.status === RED
  );

  const quickLinks = [
    {
      title: "My Fleet",
      description: "Manage vehicles, update key codes, and track status.",
      href: "/dashboard/fleet",
      icon: CarFront,
      iconBg: "bg-accent-info/10",
      iconColor: "text-accent-info",
    },
    {
      title: "Evidence Locker",
      description: "View past rentals, evidence photos, and signed waivers.",
      href: "/dashboard/history",
      icon: History,
      iconBg: "bg-accent-ops/10",
      iconColor: "text-accent-ops",
    },
    {
      title: "Maintenance Logs",
      description: "Log repairs, track service costs, and monitor health.",
      href: "/dashboard/maintenance",
      icon: Wrench,
      iconBg: "bg-accent-warning/10",
      iconColor: "text-accent-warning",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Operations overview and quick access"
      />

      {/* Onboarding / Tour */}
      <OnboardingWidget carts={typedCarts} rentals={typedRentals} profile={profile} />

      {/* Quick Access Cards */}
      <section className="space-y-4">
        <SectionHeader title="Quick Access" subtitle="Jump to key areas" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="group dossier-panel p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-dossier-elevated"
            >
              <div className={`h-11 w-11 rounded-dossier-control flex items-center justify-center ${link.iconBg}`}>
                <link.icon className={`h-5 w-5 ${link.iconColor}`} />
              </div>
              <div className="mt-4">
                <p className="font-heading text-lg font-bold text-ink">{link.title}</p>
                <p className="mt-1 text-dossier-caption text-ink-subtle">{link.description}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-accent-info">
                <span>Open</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Period Filter */}
      <div className="flex justify-end">
        <DashboardDateFilter />
      </div>

      {/* Protection Overview */}
      <ProtectionOverview
        period={period}
        protectedCount={protectedCount}
        activeCount={activeCount}
        reviewCount={reviewCount}
        documentedRate={documentedRate}
        documentedTotal={documentedTotal}
        documentedGuest={documentedGuest}
        manualCount={manualCount}
        totalDepositsHeld={totalDepositsHeld}
      />

      {/* Financial Section */}
      {profile?.show_financial_tiles !== false && (
        <FinancialSection rentals={typedRentals} period={period} />
      )}

      {/* Fleet Health Section */}
      <section className="space-y-4">
        <SectionHeader
          title="Fleet Health"
          subtitle="Automated tracking based on usage. Carts are flagged as Due Soon after 20 trips (or 11 months) and Overdue after 30 trips (or 1 year)."
        />

        {/* Health Status Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="stat-tile bg-accent-success/5 border-accent-success/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-dossier-control bg-accent-success/10">
                <Activity className="h-5 w-5 text-accent-success" />
              </div>
              <div>
                <p className="text-dossier-label text-accent-success">Healthy</p>
                <p className="text-2xl font-bold text-accent-success tabular-nums">{healthyCount}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-accent-success/80">Trips &lt; 20 and &lt; 330 days</p>
          </div>

          <div className="stat-tile bg-accent-warning/5 border-accent-warning/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-dossier-control bg-accent-warning/10">
                <Activity className="h-5 w-5 text-accent-warning" />
              </div>
              <div>
                <p className="text-dossier-label text-accent-warning">Due Soon</p>
                <p className="text-2xl font-bold text-accent-warning tabular-nums">{dueSoonCount}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-accent-warning/80">Trips 20-29 or 330-364 days</p>
          </div>

          <div className="stat-tile bg-accent-legal/5 border-accent-legal/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-dossier-control bg-accent-legal/10">
                <Activity className="h-5 w-5 text-accent-legal" />
              </div>
              <div>
                <p className="text-dossier-label text-accent-legal">Overdue</p>
                <p className="text-2xl font-bold text-accent-legal tabular-nums">{overdueCount}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-accent-legal/80">Trips ≥ 30 or ≥ 365 days</p>
          </div>
        </div>

        {/* Needs Attention Panel */}
        <div className="dossier-panel overflow-hidden">
          <div className="dossier-header-strip">
            <div>
              <p className="text-sm font-semibold text-ink">Needs Attention</p>
              <p className="text-xs text-ink-subtle">Carts that are due for service</p>
            </div>
            <Link href="/dashboard/maintenance">
              <Button variant="primary" size="sm">
                Log Service
              </Button>
            </Link>
          </div>

          {attentionList.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-success/10 mb-3">
                <Activity className="h-6 w-6 text-accent-success" />
              </div>
              <p className="text-sm font-semibold text-accent-success">All systems go!</p>
              <p className="text-xs text-ink-muted mt-1">Every cart is healthy.</p>
            </div>
          ) : (
            <div className="divide-y divide-rule">
              {attentionList.map((item) => (
                <div
                  key={item.cart.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-paper transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HealthIndicator
                      status={item.status === RED ? "overdue" : "due_soon"}
                      showDot={false}
                    />
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.cart.name}</p>
                      <p className="font-mono text-xs text-ink-muted">{item.reason}</p>
                    </div>
                  </div>
                  <Link href="/dashboard/maintenance">
                    <Button variant="secondary" size="sm">
                      Log Service
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
