'use server';

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  try {
    // Extract form data
    const fullName = formData.get("fullName")?.toString().trim() || null;
    const phone = formData.get("phone")?.toString().trim() || null;
    const companyName = formData.get("companyName")?.toString().trim() || null;
    const propertyName = formData.get("propertyName")?.toString().trim() || null;
    const billingAddress = formData.get("billingAddress")?.toString().trim() || null;

    // Create Supabase client
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

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth Error in updateProfile:", userError);
      return { error: "You must be logged in to update your profile." };
    }

    // Update the hosts table
    const { error } = await supabase
      .from("hosts")
      .update({
        full_name: fullName,
        phone_number: phone,
        company_name: companyName,
        property_name: propertyName,
        billing_address: billingAddress,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Database Update Error:", error);
      return { error: "Failed to update profile: " + error.message };
    }

    // Revalidate the settings page
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in updateProfile:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
