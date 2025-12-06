'use server';

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache"; // Import this!

export async function createCart(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const keyCode = formData.get("keyCode")?.toString().trim();
  const lastServicedAt = formData.get("lastServicedAt")?.toString().trim();
  const accessInstructions = formData.get("accessInstructions")?.toString().trim();
  const status =
    formData.get("status")?.toString().trim().toLowerCase() || "active";
  const type =
    formData.get("type")?.toString().trim().toLowerCase() || "electric";
  const accessType =
    formData.get("accessType")?.toString().trim().toLowerCase() || "included";
  const upsellPriceRaw = formData.get("upsellPrice")?.toString().trim();
  const upsellUnit = formData.get("upsellUnit")?.toString().trim() || "day";
  const accessCode = formData.get("accessCode")?.toString().trim();
  const requiresLockPhoto = formData.get("requiresLockPhoto") === "on";

  if (!name) {
    throw new Error("Cart name is required.");
  }

  const sanitizedAccessType = accessType === "upsell" ? "upsell" : "included";
  let sanitizedUpsellPrice: number | null = null;
  let sanitizedUpsellUnit: string | null = null;
  let sanitizedAccessCode: string | null = null;

  if (sanitizedAccessType === "upsell") {
    if (!upsellPriceRaw) {
      throw new Error("Upsell price is required for upsell carts.");
    }

    const parsedPrice = parseFloat(upsellPriceRaw);

    if (Number.isNaN(parsedPrice)) {
      throw new Error("Upsell price must be a valid number.");
    }

    if (!accessCode) {
      throw new Error("Access code is required for upsell carts.");
    }

    sanitizedUpsellPrice = parsedPrice;
    sanitizedUpsellUnit = upsellUnit || "day";
    sanitizedAccessCode = accessCode;
  }

  const sanitizedLastServicedAt = lastServicedAt === "" ? null : lastServicedAt;
  const sanitizedAccessInstructions =
    accessInstructions === "" || accessInstructions === undefined
      ? null
      : accessInstructions;

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
    access_instructions: sanitizedAccessInstructions,
    host_id: user.id,
    status,
    type,
    access_type: sanitizedAccessType,
    upsell_price: sanitizedUpsellPrice,
    upsell_unit: sanitizedUpsellUnit,
    access_code: sanitizedAccessCode,
    requires_lock_photo: requiresLockPhoto,
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
  const accessInstructions = formData.get("accessInstructions")?.toString().trim();
  const status =
    formData.get("status")?.toString().trim().toLowerCase() || "active";
  const type =
    formData.get("type")?.toString().trim().toLowerCase() || "electric";
  const accessType =
    formData.get("accessType")?.toString().trim().toLowerCase() || "included";
  const upsellPriceRaw = formData.get("upsellPrice")?.toString().trim();
  const upsellUnit = formData.get("upsellUnit")?.toString().trim() || "day";
  const accessCode = formData.get("accessCode")?.toString().trim();
  const requiresLockPhoto = formData.get("requiresLockPhoto") === "on";

  if (!name) {
    throw new Error("Cart name is required.");
  }

  const sanitizedAccessType = accessType === "upsell" ? "upsell" : "included";
  let sanitizedUpsellPrice: number | null = null;
  let sanitizedUpsellUnit: string | null = null;
  let sanitizedAccessCode: string | null = null;

  if (sanitizedAccessType === "upsell") {
    if (!upsellPriceRaw) {
      throw new Error("Upsell price is required for upsell carts.");
    }

    const parsedPrice = parseFloat(upsellPriceRaw);

    if (Number.isNaN(parsedPrice)) {
      throw new Error("Upsell price must be a valid number.");
    }

    if (!accessCode) {
      throw new Error("Access code is required for upsell carts.");
    }

    sanitizedUpsellPrice = parsedPrice;
    sanitizedUpsellUnit = upsellUnit || "day";
    sanitizedAccessCode = accessCode;
  }

  const sanitizedLastServicedAt = lastServicedAt === "" ? null : lastServicedAt;
  const sanitizedAccessInstructions =
    accessInstructions === "" || accessInstructions === undefined
      ? null
      : accessInstructions;

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
      access_instructions: sanitizedAccessInstructions,
      status,
      type,
      access_type: sanitizedAccessType,
      upsell_price: sanitizedUpsellPrice,
      upsell_unit: sanitizedUpsellUnit,
      access_code: sanitizedAccessCode,
      requires_lock_photo: requiresLockPhoto,
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
