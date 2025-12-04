'use server';

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createCart(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const keyCode = formData.get("keyCode")?.toString().trim();

  if (!name || !keyCode) {
    throw new Error("Cart name and key code are required.");
  }

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

  if (userError || !user) {
    throw userError ?? new Error("User not authenticated");
  }

  const { error } = await supabase.from("carts").insert({
    name,
    key_code: keyCode,
    user_id: user.id,
  });

  if (error) {
    throw error;
  }
}
