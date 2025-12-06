'use server';

import { createServerClient } from "@supabase/ssr";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

async function createSupabaseActionClient() {
  const cookieStore = await cookies();
  const headerList = await headers();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
          // Ignore cookie write failures
        }
      },
      remove(name) {
        try {
          cookieStore.delete(name);
        } catch {
          // Ignore cookie delete failures
        }
      },
    },
    headers: {
      get(key) {
        return headerList.get(key) ?? undefined;
      },
    },
  });
}

export async function signUp(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const fullName = formData.get("fullName")?.toString().trim() || null;
    const phone = formData.get("phone")?.toString().trim() || null;
    const companyName = formData.get("companyName")?.toString().trim() || null;

    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    const supabase = await createSupabaseActionClient();

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error || !data.user) {
      console.error("Sign up failed:", error);
      return { error: error?.message ?? "Unable to sign up." };
    }

    const { error: hostUpdateError } = await supabase
      .from("hosts")
      .update({
        full_name: fullName,
        phone_number: phone,
        company_name: companyName,
      })
      .eq("id", data.user.id);

    if (hostUpdateError) {
      console.error("Failed to update host profile:", hostUpdateError);
      return { error: "Account created, but profile update failed." };
    }

    redirect("/dashboard");
  } catch (error) {
    console.error("Unexpected sign up error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const supabase = await createSupabaseActionClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Sign in failed:", error);
    throw new Error(error.message);
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createSupabaseActionClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out failed:", error);
    throw new Error("Unable to sign out");
  }

  redirect("/login");
}
