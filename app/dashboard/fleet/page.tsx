import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FleetList from "../../../components/FleetList";

type Cart = {
  id: string;
  name: string;
  key_code?: string | null;
  last_serviced_at?: string | null;
  access_instructions?: string | null;
  type?: string | null;
  requires_lock_photo?: boolean | null;
  custom_photo_required?: boolean | null;
  custom_photo_label?: string | null;
  status: string;
  access_type: "included" | "upsell";
  upsell_price?: number | null;
  upsell_unit?: string | null;
  access_code?: string | null;
  deposit_amount?: number | null;
  is_currently_rented: boolean;
};

export default async function DashboardPage() {
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

  const cartSelectFields =
    "id, name, key_code, last_serviced_at, access_instructions, status, type, requires_lock_photo, access_type, upsell_price, upsell_unit, access_code, deposit_amount, custom_photo_required, custom_photo_label";

  const { data: carts = [] } = await supabase
    .from("carts")
    .select(cartSelectFields)
    .eq("host_id", user.id)
    .order("name");

  const { data: activeRentals = [] } = await supabase
    .from("rentals")
    .select("cart_id, carts!inner(host_id)")
    .eq("status", "active")
    .eq("carts.host_id", user.id);

  const activeRentalIds = new Set(
    (activeRentals ?? []).map((rental) => rental.cart_id)
  );

  const cartsWithRentalStatus = ((carts as any[]) ?? []).map((cart) => ({
    ...cart,
    is_currently_rented: activeRentalIds.has(cart.id),
  }));

  return <FleetList carts={cartsWithRentalStatus as Cart[]} />;
}
