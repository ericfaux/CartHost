import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import SettingsForm, {
  type HostProfile,
} from "../../../components/SettingsForm";

export default async function SettingsPage() {
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

  const { data: profile, error: profileError } = await supabase
    .from("hosts")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profileError) {
    console.error("Failed to load host profile", profileError);
    throw new Error("Unable to load host profile.");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Account Settings
        </h1>
        <p className="text-sm text-gray-500">
          Manage your profile and subscription.
        </p>
      </div>

      <SettingsForm profile={profile as HostProfile} />
    </div>
  );
}
