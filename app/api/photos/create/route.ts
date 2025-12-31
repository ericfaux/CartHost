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

    // Optional: ensure the user is host for the cart or rental (best practice)
    const hostId = userId; // hosts.id maps to auth user id in your schema
    if (cartId) {
      const { data: cartRow, error: cartErr } = await supabaseAdmin
        .from("carts")
        .select("host_id")
        .eq("id", cartId)
        .maybeSingle();
      if (cartErr) {
        return NextResponse.json({ error: "Failed to verify cart" }, { status: 500 });
      }
      if (cartRow && cartRow.host_id !== userId) {
        return NextResponse.json({ error: "Not authorized for this cart" }, { status: 403 });
      }
    } else if (rentalId) {
      const { data: rentalRow, error: rErr } = await supabaseAdmin
        .from("rentals")
        .select("cart_id")
        .eq("id", rentalId)
        .maybeSingle();
      if (rErr) return NextResponse.json({ error: "Failed to verify rental" }, { status: 500 });
      if (rentalRow) {
        const { data: cartRow } = await supabaseAdmin
          .from("carts")
          .select("host_id")
          .eq("id", rentalRow.cart_id)
          .maybeSingle();
        if (cartRow && cartRow.host_id !== userId) return NextResponse.json({ error: "Not authorized for this rental" }, { status: 403 });
      }
    }

    // Get uploader metadata from headers: user-agent and client IP
    const userAgent = request.headers.get("user-agent") || null;
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null;

    // Insert photos row (verified = false)
    const insertRow = {
      rental_id: rentalId || null,
      cart_id: cartId || null,
      host_id: hostId,
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

    const { data: insertData, error: insertErr } = await supabaseAdmin
      .from("photos")
      .insert(insertRow)
      .select()
      .single();
    if (insertErr) {
      return NextResponse.json({ error: "Insert failed: " + insertErr.message }, { status: 500 });
    }

    // Start server verification asynchronously (do not expose service key to client)
    const photoId = insertData.id;
    // Fire-and-forget: try to verify and log; if it errors, it will need manual retry via verify route
    (async () => {
      try {
        await verifyAndUpdate(photoId, storagePath, "evidence");
      } catch (e) {
        console.error("photo verification failed for", photoId, e);
      }
    })();

    return NextResponse.json({ photoId, status: "verifying" }, { status: 201 });
  } catch (err) {
    console.error("create photo route error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
