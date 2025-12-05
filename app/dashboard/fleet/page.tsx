import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FleetList from "../../../components/FleetList";

type Cart = {
  id: string;
  name: string;
  key_code?: string | null;
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

  const { data: carts = [] } = await supabase
    .from("carts")
    .select("id, name, key_code")
    .eq("host_id", user.id)
    .order("name");

  return <FleetList carts={carts as Cart[]} />;
}
