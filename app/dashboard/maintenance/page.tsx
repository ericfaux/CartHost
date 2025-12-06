import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AddMaintenanceModal from "../../../components/AddMaintenanceModal";
import MaintenanceList from "../../../components/MaintenanceList";

type Cart = {
  id: string;
  name: string;
};

type ServiceLog = {
  id: string;
  service_date: string;
  service_type: string;
  cost?: number | null;
  notes?: string | null;
  carts?: {
    name?: string | null;
  } | null;
};

export default async function MaintenancePage() {
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
            // Ignore cookie setting errors
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
    .select("id, name")
    .eq("host_id", user.id)
    .order("name");

  const { data: logs = [] } = await supabase
    .from("service_logs")
    .select("id, service_date, service_type, cost, notes, carts(name)")
    .eq("host_id", user.id)
    .order("service_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Log</h1>
          <p className="text-sm text-gray-500">
            Track service history and upkeep for your fleet.
          </p>
        </div>
        <AddMaintenanceModal carts={carts as Cart[]} />
      </div>

      <MaintenanceList logs={logs as ServiceLog[]} />
    </div>
  );
}
