'use server';

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateRentalRevenue(rentalId: string, newRevenue: number) {
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
            // Ignore cookie write failures during server rendering
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
    console.error("Auth Error in updateRentalRevenue:", userError);
    return { error: "You must be logged in to update rental revenue." };
  }

  // 2. Verify ownership by checking the rental belongs to a cart owned by this user
  const { data: rental, error: fetchError } = await supabase
    .from("rentals")
    .select("id, carts!inner(host_id)")
    .eq("id", rentalId)
    .eq("carts.host_id", user.id)
    .single();

  if (fetchError || !rental) {
    console.error("Ownership verification failed:", fetchError);
    return { error: "Rental not found or you do not have permission to edit it." };
  }

  // 3. Update the revenue
  const { error: updateError } = await supabase
    .from("rentals")
    .update({ revenue: newRevenue })
    .eq("id", rentalId);

  if (updateError) {
    console.error("Database Update Error:", updateError);
    return { error: "Failed to update revenue: " + updateError.message };
  }

  // 4. Revalidate affected paths
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function updateDepositStatus(rentalId: string, status: string) {
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
            // Ignore cookie write failures during server rendering
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
    console.error("Auth Error in updateDepositStatus:", userError);
    return { error: "You must be logged in to update deposit status." };
  }

  // 2. Validate status is one of the allowed values
  const validStatuses = ['pending', 'collected', 'refunded', 'withheld'];
  if (!validStatuses.includes(status)) {
    return { error: "Invalid deposit status. Must be one of: pending, collected, refunded, withheld." };
  }

  // 3. Verify ownership by checking the rental belongs to a cart owned by this user
  const { data: rental, error: fetchError } = await supabase
    .from("rentals")
    .select("id, carts!inner(host_id)")
    .eq("id", rentalId)
    .eq("carts.host_id", user.id)
    .single();

  if (fetchError || !rental) {
    console.error("Ownership verification failed:", fetchError);
    return { error: "Rental not found or you do not have permission to edit it." };
  }

  // 4. Update the deposit status
  const { error: updateError } = await supabase
    .from("rentals")
    .update({ deposit_status: status })
    .eq("id", rentalId);

  if (updateError) {
    console.error("Database Update Error:", updateError);
    return { error: "Failed to update deposit status: " + updateError.message };
  }

  // 5. Revalidate the history page
  revalidatePath("/dashboard/history");

  return { success: true };
}
