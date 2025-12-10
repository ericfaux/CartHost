'use server';

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

type UpdateProfileState = { success?: boolean; error?: string } | null;

export async function updateProfile(
  _prevState: UpdateProfileState,
  formData: FormData
) {
  try {
    // Extract form data
    const fullName = formData.get("fullName")?.toString().trim() || null;
    const phone = formData.get("phone")?.toString().trim() || null;
    const companyName = formData.get("companyName")?.toString().trim() || null;
    const propertyName = formData.get("propertyName")?.toString().trim() || null;
    const billingAddress = formData.get("billingAddress")?.toString().trim() || null;
    const defaultDepositRaw = formData.get("defaultDeposit")?.toString().trim() || "";
    const enableGuestTextSupport = Boolean(formData.get("enableGuestTextSupport"));
    const showFinancialTiles = Boolean(formData.get("showFinancialTiles"));
    const enableSmsNotifications = Boolean(formData.get("enableSmsNotifications"));
    
    // Extract and sanitize welcomeMessage: limit to 100 characters
    const welcomeMessageRaw = formData.get("welcomeMessage")?.toString().trim() || null;
    const welcomeMessage = welcomeMessageRaw ? welcomeMessageRaw.slice(0, 100) : null;
    
    // Sanitize defaultDeposit: parse to float, default to 0 if invalid
    const parsedDeposit = parseFloat(defaultDepositRaw);
    const sanitizedDeposit = isNaN(parsedDeposit) ? 0 : parsedDeposit;

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
        default_deposit: sanitizedDeposit,
        welcome_message: welcomeMessage,
        enable_guest_text_support: enableGuestTextSupport,
        show_financial_tiles: showFinancialTiles,
        enable_sms_notifications: enableSmsNotifications,
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
