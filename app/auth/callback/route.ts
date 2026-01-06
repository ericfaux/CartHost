import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
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
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // If a specific next path was provided (e.g., for password reset), use it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Check subscription status to determine redirect
      const { data: host } = await supabase
        .from("hosts")
        .select("subscription_status, is_beta_user")
        .eq("id", data.user.id)
        .single();

      // Beta users go to dashboard
      if (host?.is_beta_user) {
        return NextResponse.redirect(`${origin}/dashboard`);
      }

      // Users with pending or canceled status go to subscribe page
      if (host?.subscription_status === "pending" || host?.subscription_status === "canceled") {
        return NextResponse.redirect(`${origin}/subscribe`);
      }

      // Active/trialing/past_due users go to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=AuthFailed`);
}
