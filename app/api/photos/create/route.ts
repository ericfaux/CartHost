import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../server/supabase-admin";
import verifyAndUpdate from "../../../../server/lib/photoVerifier";

export const runtime = "nodejs"; // ensure Node runtime

export async function POST(request: NextRequest) {
  try {
    // Initialize admin client at runtime (lazy)
    const supabaseAdmin = getSupabaseAdmin();

    // Ensure this is a JSON request
    const body = await request.json();
    const { storagePath, fileName, mimeType, rentalId, cartId, advisoryHash, advisoryGps, kind } = body;

    // Validation: Return 400 if storagePath or fileName is missing
    if (!storagePath) {
      return NextResponse.json({ error: "storagePath is required" }, { status: 400 });
    }
    if (!fileName && !storagePath.includes("/")) {
      // If no fileName and storagePath doesn't look like a path, require fileName
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }

    const resolvedFileName = fileName || storagePath.split("/").pop() || storagePath;

    // Authorize: expect Authorization: Bearer <access_token>
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    // Verify token via supabase admin
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid access token" }, { status: 401 });
    }
    const userId = userData.user.id;

    // Variables to track authorization and resolved IDs
    let isAuthorized = false;
    let realHostId: string | null = null;
    let resolvedCartId: string | null = cartId || null;

    // Dual Authorization: Check if user is Host OR Guest
    // IMPORTANT: Do NOT early-return 403 if host check fails - proceed to check guest permissions
    if (cartId) {
      // If cartId is provided directly, check if user is the host
      const cartResp = await supabaseAdmin
        .from("carts")
        .select("host_id")
        .eq("id", cartId)
        .maybeSingle();

      if (cartResp.error) {
        console.error("Failed to verify cart:", cartResp.error);
        return NextResponse.json({ error: "Failed to verify cart" }, { status: 500 });
      }

      const cartRow = cartResp.data as { host_id: string } | null;
      if (cartRow) {
        // Capture the realHostId from the cart regardless of who is uploading
        realHostId = cartRow.host_id;

        if (cartRow.host_id === userId) {
          // User is the host
          isAuthorized = true;
        } else if (rentalId) {
          // Host check failed - proceed to check if user is the guest for this rental
          const rentalResp = await supabaseAdmin
            .from("rentals")
            .select("guest_id, cart_id")
            .eq("id", rentalId)
            .eq("cart_id", cartId)
            .maybeSingle();

          if (rentalResp.error) {
            console.error("Failed to verify rental:", rentalResp.error);
            return NextResponse.json({ error: "Failed to verify rental" }, { status: 500 });
          }

          const rentalRow = rentalResp.data as { guest_id: string; cart_id: string } | null;
          if (rentalRow && rentalRow.guest_id === userId) {
            // User is the guest for this rental - authorized
            isAuthorized = true;
            // realHostId already set from cart lookup above
          }
        }
      }
    } else if (rentalId) {
      // No cartId provided, but we have rentalId - look up rental with cart join
      const rentalResp = await supabaseAdmin
        .from("rentals")
        .select("guest_id, cart_id, carts!inner(host_id)")
        .eq("id", rentalId)
        .maybeSingle();

      if (rentalResp.error) {
        console.error("Failed to verify rental:", rentalResp.error);
        return NextResponse.json({ error: "Failed to verify rental" }, { status: 500 });
      }

      const rentalRow = rentalResp.data as {
        guest_id: string;
        cart_id: string;
        carts: { host_id: string };
      } | null;

      if (rentalRow) {
        const cartHostId = rentalRow.carts?.host_id;
        resolvedCartId = rentalRow.cart_id;
        realHostId = cartHostId || null;

        if (cartHostId === userId) {
          // User is the host
          isAuthorized = true;
        } else if (rentalRow.guest_id === userId) {
          // User is the guest for this rental
          isAuthorized = true;
        }
      }
    }

    // Only return 403 if BOTH host and guest checks failed
    if (!isAuthorized || !realHostId) {
      return NextResponse.json({ error: "Not authorized to upload photos for this rental" }, { status: 403 });
    }

    // Get uploader metadata from headers: user-agent and client IP
    const userAgent = request.headers.get("user-agent") || null;
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null;

    // Insert photos row (verified = false)
    // IMPORTANT: Always use realHostId (the actual host of the cart), never save the guest's ID as host_id
    const insertRow = {
      rental_id: rentalId || null,
      cart_id: resolvedCartId,
      host_id: realHostId,
      storage_path: storagePath,
      file_name: resolvedFileName,
      mime_type: mimeType || null,
      sha256: advisoryHash || null,
      gps_lat: advisoryGps?.latitude ?? null,
      gps_lng: advisoryGps?.longitude ?? null,
      metadata: { advisoryGps: advisoryGps ?? null },
      uploader_ip: ip,
      uploader_ua: userAgent,
      verified: false,
      kind: kind || "pre_ride", // Default to 'pre_ride' if not specified
    };

    const insertResp = await supabaseAdmin
      .from("photos")
      .insert(insertRow)
      .select()
      .single();

    if (insertResp.error) {
      console.error("Photo insert failed:", insertResp.error);
      return NextResponse.json({ error: "Insert failed: " + insertResp.error.message }, { status: 500 });
    }

    const insertData = insertResp.data as { id: string } | null;
    if (!insertData) {
      return NextResponse.json({ error: "Insert failed: no data returned" }, { status: 500 });
    }

    // Start server verification (do not expose service key to client)
    // IMPORTANT: Wrap in try/catch - if verification fails, log but do NOT fail the request
    // The photo row must remain in the database
    const photoId = insertData.id;
    try {
      await verifyAndUpdate(photoId, storagePath, "evidence");
    } catch (verifyError) {
      // Log the verification error but allow the request to succeed
      console.error("Photo verification failed (non-fatal):", verifyError);
      // The photo record remains in the database with verified=false
    }

    return NextResponse.json({ photoId, status: "verifying" }, { status: 200 });
  } catch (err) {
    console.error("create photo route error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
