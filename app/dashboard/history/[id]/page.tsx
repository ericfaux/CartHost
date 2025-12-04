import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import RentalDetail from "../../../../components/RentalDetail";

type Rental = {
  id: string;
  created_at: string;
  guest_name?: string | null;
  status?: string | null;
  photos?: string[] | null;
  carts?: {
    name?: string | null;
  } | null;
};

export default async function RentalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  // --- THE FIX IS HERE ---
  const { data: rental, error } = await supabase
    .from("rentals")
    // 1. Use !inner to ensure the cart relation exists and matches filters
    .select("*, carts!inner(name, host_id)")
    .eq("id", id)
    // 2. Filter against the joined cart's host_id
    .eq("carts.host_id", user.id)
    .single();
  // -----------------------

  if (!rental || error) {
    // This handles cases where the rental doesn't exist OR belongs to another host
    notFound();
  }

  return <RentalDetail rental={rental as Rental} />;
}
