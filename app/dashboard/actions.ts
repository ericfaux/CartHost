'use server';

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache"; // Import this!

export async function createCart(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const keyCode = formData.get("keyCode")?.toString().trim();
  const lastServicedAt = formData.get("lastServicedAt")?.toString().trim();

  if (!name || !keyCode) {
    throw new Error("Cart name and key code are required.");
  }

  const sanitizedLastServicedAt = lastServicedAt === "" ? null : lastServicedAt;

  const cookieStore = await cookies();

  // Initialize Supabase Client
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
            // Ignore
          }
        },
      },
    }
  );

  // 1. Verify Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth Error in createCart:", userError);
    throw new Error("You must be logged in to add a cart.");
  }

  // 2. Insert Data
  const { error } = await supabase.from("carts").insert({
    name,
    key_code: keyCode,
    last_serviced_at: sanitizedLastServicedAt,
    host_id: user.id,
  });

  if (error) {
    console.error("Database Insert Error:", error);
    throw new Error("Failed to save cart: " + error.message);
  }

  // 3. Refresh the Dashboard
  revalidatePath("/dashboard");
}

export async function updateCart(id: string, formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const keyCode = formData.get("keyCode")?.toString().trim();
  const lastServicedAt = formData.get("lastServicedAt")?.toString().trim();

  if (!name || !keyCode) {
    throw new Error("Cart name and key code are required.");
  }

  const sanitizedLastServicedAt = lastServicedAt === "" ? null : lastServicedAt;

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
            // Ignore
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
    console.error("Auth Error in updateCart:", userError);
    throw new Error("You must be logged in to update a cart.");
  }

  const { error } = await supabase
    .from("carts")
    .update({
      name,
      key_code: keyCode,
      last_serviced_at: sanitizedLastServicedAt,
    })
    .eq("id", id)
    .eq("host_id", user.id)
    .select("id")
    .single();

  if (error) {
    console.error("Database Update Error:", error);
    throw new Error("Failed to update cart: " + error.message);
  }

  revalidatePath("/dashboard");
}

export async function deleteCart(id: string) {
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
            // Ignore
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
    console.error("Auth Error in deleteCart:", userError);
    throw new Error("You must be logged in to delete a cart.");
  }

  const { error } = await supabase
    .from("carts")
    .delete()
    .eq("id", id)
    .eq("host_id", user.id)
    .select("id")
    .single();

  if (error) {
    console.error("Database Delete Error:", error);
    throw new Error("Failed to delete cart: " + error.message);
  }

  revalidatePath("/dashboard");
}
