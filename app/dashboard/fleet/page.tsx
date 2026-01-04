import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FleetList from "../../../components/FleetList";

// Interface for host branding data used in asset tags
interface HostBranding {
  propertyName: string;
  phone?: string;
  logoUrl?: string;
}

type Cart = {
  id: string;
  name: string;
  key_code?: string | null;
  last_serviced_at?: string | null;
  access_instructions?: string | null;
  type?: string | null;
  requires_lock_photo?: boolean | null;
  requires_plug_photo?: boolean | null;
  status: string;
  access_type: "included" | "upsell";
  upsell_price?: number | null;
  upsell_unit?: string | null;
  access_code?: string | null;
  deposit_amount?: number | null;
  is_currently_rented: boolean;
  active_rental_id?: string | null;
  tripsSinceService: number;
  custom_photo_required?: boolean | null;
  custom_photo_label?: string | null;
  photo_requirements?: string[] | null;
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

  // FIX APPLIED HERE: Removed 'logo_url' from the select string because it does not exist in the DB.
  // This was causing the entire query to fail (returning null), which broke the property name logic.
  const { data: hostProfile, error: hostProfileError } = await supabase
    .from("hosts")
    .select("property_name, phone_number, company_name, full_name") // <--- REMOVED logo_url
    .eq("id", user.id)
    .single();

  // Helper function to safely get a string
  const safeStr = (str: string | null | undefined) => (str || "").trim();

  // SMART FALLBACK LOGIC:
  const pName = safeStr(hostProfile?.property_name);
  const cName = safeStr(hostProfile?.company_name);
  const fName = safeStr(hostProfile?.full_name);

  // Use the first non-empty value found
  const propertyName = pName || cName || fName || "CartHost Property";

  const hostBranding: HostBranding = {
    propertyName: propertyName,
    phone: safeStr(hostProfile?.phone_number) || undefined,
    // Explicitly undefined since the column is missing in DB
    logoUrl: undefined, 
  };

  // DEBUG LOG: This should now show actual data instead of null
  console.log("------------------------------------------------");
  console.log("[Fleet Page] User ID:", user.id);
  console.log("[Fleet Page] Branding Success:", propertyName);
  console.log("------------------------------------------------");

  const cartSelectFields =
    "id, name, key_code, last_serviced_at, access_instructions, status, type, requires_lock_photo, requires_plug_photo, access_type, upsell_price, upsell_unit, access_code, deposit_amount, custom_photo_required, custom_photo_label, photo_requirements";

  const { data: carts = [] } = await supabase
    .from("carts")
    .select(cartSelectFields)
    .eq("host_id", user.id)
    .order("name");

  const { data: activeRentals = [] } = await supabase
    .from("rentals")
    .select("id, cart_id, carts!inner(host_id)")
    .in("status", ["active", "needs_review"])
    .eq("carts.host_id", user.id);

  const { data: completedRentals = [] } = await supabase
    .from("rentals")
    .select("cart_id, created_at, status, carts!inner(host_id)")
    .eq("status", "completed")
    .eq("carts.host_id", user.id);

  const activeRentalByCartId = new Map<string, string>();
  (activeRentals ?? []).forEach((rental: any) => {
    if (rental?.cart_id && rental?.id) {
      activeRentalByCartId.set(rental.cart_id, rental.id);
    }
  });

  const completedRentalsByCartId = new Map<string, Array<{ created_at?: string | null }>>();
  (completedRentals ?? []).forEach((rental: any) => {
    if (!rental?.cart_id) return;
    const existing = completedRentalsByCartId.get(rental.cart_id) ?? [];
    existing.push({ created_at: rental.created_at ?? null });
    completedRentalsByCartId.set(rental.cart_id, existing);
  });

  const cartsWithRentalStatus = ((carts as any[]) ?? []).map((cart) => ({
    ...cart,
    active_rental_id: activeRentalByCartId.get(cart.id) ?? null,
    is_currently_rented: activeRentalByCartId.has(cart.id),
    tripsSinceService: (() => {
      const rentalsForCart = completedRentalsByCartId.get(cart.id) ?? [];
      if (!cart.last_serviced_at) return rentalsForCart.length;
      const lastServicedAt = new Date(cart.last_serviced_at);
      return rentalsForCart.filter((r) => {
        if (!r?.created_at) return false;
        return new Date(r.created_at) > lastServicedAt;
      }).length;
    })(),
  }));

  return <FleetList carts={cartsWithRentalStatus as Cart[]} hostBranding={hostBranding} />;
}
