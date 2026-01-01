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
    const { storagePath, fileName, mimeType, rentalId, cartId, advisoryHash, advisoryGps } = body;

    if (!storagePath || !fileName) {
      return NextResponse.json({ error: "storagePath and fileName are required" }, { status: 400 });
    }

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
    if (cartId) {
      // If cartId is provided directly, check if user is the host
      const cartResp = await supabaseAdmin
        .from("carts")
        .select("host_id")
        .eq("id", cartId)
        .maybeSingle();

      if ((cartResp as any).error) {
        return NextResponse.json({ error: "Failed to verify cart" }, { status: 500 });
      }

      const cartRow = (cartResp as any).data;
      if (cartRow) {
        if ((cartRow as any).host_id === userId) {
          // User is the host
          isAuthorized = true;
          realHostId = userId;
        } else if (rentalId) {
          // User is not the host, but we have a rentalId - check if they're the guest
          const rentalResp = await supabaseAdmin
            .from("rentals")
            .select("guest_id, cart_id")
            .eq("id", rentalId)
            .eq("cart_id", cartId)
            .maybeSingle();

          if ((rentalResp as any).error) {
            return NextResponse.json({ error: "Failed to verify rental" }, { status: 500 });
          }

          const rentalRow = (rentalResp as any).data;
          if (rentalRow && (rentalRow as any).guest_id === userId) {
            // User is the guest for this rental
            isAuthorized = true;
            realHostId = (cartRow as any).host_id; // Use the cart's host_id
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

      if ((rentalResp as any).error) {
        return NextResponse.json({ error: "Failed to verify rental" }, { status: 500 });
      }

      const rentalRow = (rentalResp as any).data;
      if (rentalRow) {
        const cartData = (rentalRow as any).carts;
        const cartHostId = cartData?.host_id;
        resolvedCartId = (rentalRow as any).cart_id;

        if (cartHostId === userId) {
          // User is the host
          isAuthorized = true;
          realHostId = userId;
        } else if ((rentalRow as any).guest_id === userId) {
          // User is the guest for this rental
          isAuthorized = true;
          realHostId = cartHostId; // Use the cart's host_id
        }
      }
    }

    // If neither host nor guest authorization passed, return 403
    if (!isAuthorized || !realHostId) {
      return NextResponse.json({ error: "Not authorized to upload photos for this rental" }, { status: 403 });
    }

    // Get uploader metadata from headers: user-agent and client IP
    const userAgent = request.headers.get("user-agent") || null;
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null;

    // Insert photos row (verified = false)
    // Use realHostId (the actual host of the cart) and resolvedCartId (derived from rental if needed)
    const insertRow = {
      rental_id: rentalId || null,
      cart_id: resolvedCartId,
      host_id: realHostId,
      storage_path: storagePath,
      file_name: fileName,
      mime_type: mimeType || null,
      sha256: advisoryHash || null,
      gps_lat: advisoryGps?.latitude ?? null,
      gps_lng: advisoryGps?.longitude ?? null,
      metadata: { advisoryGps: advisoryGps ?? null },
      uploader_ip: ip,
      uploader_ua: userAgent,
      verified: false,
    };

    const insertResp = await (supabaseAdmin.from("photos") as any)
      .insert(insertRow)
      .select()
      .single();
    if ((insertResp as any).error) {
      return NextResponse.json({ error: "Insert failed: " + (insertResp as any).error.message }, { status: 500 });
    }
    const insertData = (insertResp as any).data;
    if (!insertData) {
      return NextResponse.json({ error: "Insert failed: no data returned" }, { status: 500 });
    }

    // Start server verification (do not expose service key to client)
    const photoId = (insertData as any).id;
    try {
      await verifyAndUpdate(photoId, storagePath, "evidence");
    } catch (e) {
      console.error("Verification failed:", e);
      // Allow insert to succeed even if verification fails.
    }

    return NextResponse.json({ photoId, status: "verifying" }, { status: 201 });
  } catch (err) {
    console.error("create photo route error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
