"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface BetaAccessState {
  success: boolean;
  message: string;
  errors?: {
    email?: string;
    general?: string;
  };
}

/**
 * Server Action to handle beta access requests
 * Sends an email notification to admin when a user requests beta access
 */
export async function requestBetaAccess(
  prevState: BetaAccessState | null,
  formData: FormData
): Promise<BetaAccessState> {
  try {
    // Extract form data
    const email = formData.get("email") as string;
    const location = formData.get("location") as string;
    const vehicleCount = formData.get("vehicleCount") as string;
    const notes = formData.get("notes") as string;

    // Extract asset types (checkboxes)
    const golfCarts = formData.get("assetTypes.golfCarts") === "true";
    const ebikes = formData.get("assetTypes.ebikes") === "true";
    const kayaks = formData.get("assetTypes.kayaks") === "true";
    const other = formData.get("assetTypes.other") === "true";

    // Validation
    if (!email || email.trim() === "") {
      return {
        success: false,
        message: "Email is required",
        errors: {
          email: "Email is required",
        },
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Please enter a valid email address",
        errors: {
          email: "Please enter a valid email address",
        },
      };
    }

    // Build asset types list
    const assetTypesList: string[] = [];
    if (golfCarts) assetTypesList.push("Golf Carts");
    if (ebikes) assetTypesList.push("E-Bikes");
    if (kayaks) assetTypesList.push("Kayaks / Paddleboards");
    if (other) assetTypesList.push("Other amenities");

    const assetTypesDisplay =
      assetTypesList.length > 0
        ? assetTypesList.join(", ")
        : "Not specified";

    // Send email to admin
    const { data, error } = await resend.emails.send({
      from: "CartHost Beta <onboarding@resend.dev>",
      to: ["carthost.app@gmail.com"],
      subject: `🚀 New Beta Request: ${email}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Beta Access Request</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🚀 New Beta Request</h1>
            </div>

            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
              <h2 style="color: #495057; margin-top: 0; font-size: 20px;">Request Details</h2>

              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 12px; background: white; border: 1px solid #dee2e6; font-weight: 600; width: 180px;">
                    📧 Email
                  </td>
                  <td style="padding: 12px; background: white; border: 1px solid #dee2e6;">
                    <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px; background: white; border: 1px solid #dee2e6; font-weight: 600;">
                    📍 Location
                  </td>
                  <td style="padding: 12px; background: white; border: 1px solid #dee2e6;">
                    ${location || "<em style='color: #6c757d;'>Not specified</em>"}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px; background: white; border: 1px solid #dee2e6; font-weight: 600;">
                    🚗 Vehicle Count
                  </td>
                  <td style="padding: 12px; background: white; border: 1px solid #dee2e6;">
                    ${vehicleCount || "<em style='color: #6c757d;'>Not specified</em>"}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 12px; background: white; border: 1px solid #dee2e6; font-weight: 600;">
                    🏷️ Asset Types
                  </td>
                  <td style="padding: 12px; background: white; border: 1px solid #dee2e6;">
                    ${assetTypesDisplay}
                  </td>
                </tr>

                ${
                  notes
                    ? `
                <tr>
                  <td colspan="2" style="padding: 12px; background: white; border: 1px solid #dee2e6;">
                    <strong style="display: block; margin-bottom: 8px;">💬 Additional Notes:</strong>
                    <p style="margin: 0; white-space: pre-wrap; color: #495057;">${notes}</p>
                  </td>
                </tr>
                `
                    : ""
                }
              </table>

              <div style="background: white; padding: 16px; border-radius: 6px; border-left: 4px solid #667eea; margin-top: 20px;">
                <p style="margin: 0; color: #6c757d; font-size: 14px;">
                  <strong>Submitted:</strong> ${new Date().toLocaleString("en-US", {
                    dateStyle: "full",
                    timeStyle: "long",
                  })}
                </p>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center;">
                <a href="mailto:${email}?subject=Welcome%20to%20CartHost%20Beta&body=Hi%20there%2C%0A%0AWe%27re%20excited%20to%20have%20you%20join%20the%20CartHost%20beta%20program%21"
                   style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                  Reply to ${email.split("@")[0]}
                </a>
              </div>
            </div>

            <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
              <p>CartHost Beta Access System</p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        message: "Failed to send request. Please try again.",
        errors: {
          general: error.message || "Failed to send email",
        },
      };
    }

    console.log("Beta access request sent successfully:", data);

    return {
      success: true,
      message: "Request sent! We'll be in touch within 24-48 hours.",
    };
  } catch (error) {
    console.error("Error in requestBetaAccess:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      errors: {
        general:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    };
  }
}
