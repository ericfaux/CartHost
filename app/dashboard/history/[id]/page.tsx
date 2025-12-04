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

// FIX: params is now a Promise in Next.js 15
export default async function RentalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // <--- AWAIT THE PARAMS HERE

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

  const { data: rental, error } = await supabase
    .from("rentals")
    .select("*, carts(name)")
    .eq("id", id) // Use the awaited 'id'
    .eq("host_id", user.id) // Ensure security (host can only see their own rentals)
    .single();

  if (!rental || error) {
    notFound();
  }

  return <RentalDetail rental={rental as Rental} />;
}
