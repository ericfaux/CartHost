import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

const GREEN = "healthy" as const;
const YELLOW = "dueSoon" as const;
const RED = "overdue" as const;

type Cart = {
  id: string;
  name: string;
  last_serviced_at?: string | null;
};

type Rental = {
  cart_id: string;
  created_at: string;
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

export default async function DashboardHome() {
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
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login");
  }

  const { data: carts = [] } = await supabase
    .from("carts")
    .select("id, name, last_serviced_at")
    .eq("host_id", user.id)
    .order("name");

  const { data: rentals = [] } = await supabase
    .from("rentals")
    .select("cart_id, created_at, carts!inner(host_id)")
    .eq("carts.host_id", user.id);

  const today = new Date();
  const health = calculateHealth(carts as Cart[], rentals as Rental[], today);

  const healthyCount = health.filter((item) => item.status === GREEN).length;
  const dueSoonCount = health.filter((item) => item.status === YELLOW).length;
  const overdueCount = health.filter((item) => item.status === RED).length;

  const attentionList = health.filter(
    (item) => item.status === YELLOW || item.status === RED
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Fleet Health</h1>
        <p className="text-sm text-gray-500">
          Monitor service intervals and keep every vehicle guest-ready.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-green-100 bg-green-50 px-6 py-5 shadow-sm">
          <p className="text-sm font-semibold text-green-700">Healthy</p>
          <p className="mt-2 text-3xl font-black text-green-900">{healthyCount}</p>
          <p className="mt-1 text-xs text-green-700/80">Trips &lt; 20 and &lt; 330 days</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-6 py-5 shadow-sm">
          <p className="text-sm font-semibold text-amber-700">Due Soon</p>
          <p className="mt-2 text-3xl font-black text-amber-900">{dueSoonCount}</p>
          <p className="mt-1 text-xs text-amber-700/80">Trips ≥ 20 or ≥ 330 days</p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-5 shadow-sm">
          <p className="text-sm font-semibold text-red-700">Overdue</p>
          <p className="mt-2 text-3xl font-black text-red-900">{overdueCount}</p>
          <p className="mt-1 text-xs text-red-700/80">Trips ≥ 30 or ≥ 365 days</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Needs Attention</p>
            <p className="text-xs text-gray-500">Carts that are due for service.</p>
          </div>
          <Link
            href="/dashboard/maintenance"
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            Log Service
          </Link>
        </div>

        {attentionList.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm font-semibold text-green-700">
            All systems go! Every cart is healthy.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {attentionList.map((item) => (
              <div
                key={item.cart.id}
                className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.cart.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.status === RED ? "Overdue" : "Due soon"} · {item.reason}
                  </p>
                </div>
                <Link
                  href="/dashboard/maintenance"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
                >
                  Log Service
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
