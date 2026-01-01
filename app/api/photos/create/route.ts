import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../server/supabase-admin";
import verifyAndUpdate from "../../../../server/lib/photoVerifier";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { storagePath, fileName, mimeType, rentalId, cartId, advisoryHash, advisoryGps, kind } = body;

    if (!storagePath || !fileName) {
      return NextResponse.json({ error: "storagePath and fileName are required" }, { status: 400 });
    }

    // 1. Verify User Token
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "Missing access token" }, { status: 401 });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return NextResponse.json({ error: "Invalid access token" }, { status: 401 });
    const userId = userData.user.id;

    // 2. Authorization Logic
    let realHostId = userId;
    let isAuthorized = false;

    // Check 1: Is user the Host?
    if (cartId) {
      const { data: cart } = await supabaseAdmin.from("carts").select("host_id").eq("id", cartId).single();
      
      // FIX 1: Cast 'cart' to any to prevent "property does not exist on type never" error
      if (cart) {
        const cartHostId = (cart as any).host_id;
        
        if (cartHostId === userId) {
          isAuthorized = true; // User IS the host
          realHostId = userId;
        } else {
          realHostId = cartHostId; // User is NOT host, but we know who the host is
        }
      }
    }

    // Check 2: Is user the Guest? (Run this even if cartId was present but failed host check)
    if (!isAuthorized && rentalId) {
      const { data: rental } = await supabaseAdmin.from("rentals").select("guest_id, cart_id").eq("id", rentalId).single();
      
      // FIX 2: Cast 'rental' to any
      if (rental && (rental as any).guest_id === userId) {
        isAuthorized = true;
        
        // Safety: Ensure we have the correct host_id if we didn't get it from cartId block above
        if (realHostId === userId && (rental as any).cart_id) {
           const { data: c } = await supabaseAdmin.from("carts").select("host_id").eq("id", (rental as any).cart_id).single();
           if (c) realHostId = (c as any).host_id;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Not authorized. Must be Host or assigned Guest." }, { status: 403 });
    }

    // Get uploader metadata from headers
    const userAgent = request.headers.get("user-agent") || "";
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";

    // 3. Insert Row
    const insertRow = {
      rental_id: rentalId || null,
      cart_id: cartId || null,
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
      kind: kind || 'pre_ride',
    };

    // FIX 3: Cast query builder to 'any' to bypass "not assignable to parameter of type 'never'"
    const insertResp = await (supabaseAdmin.from("photos") as any)
      .insert(insertRow)
      .select()
      .single();

    // Handle potential error from the manually typed response
    const insertError = (insertResp as any).error;
    const insertData = (insertResp as any).data;

    if (insertError || !insertData) {
      return NextResponse.json({ error: insertError?.message || "Insert failed" }, { status: 500 });
    }

    // 4. Verification
    try {
      await verifyAndUpdate(insertData.id, storagePath, "evidence");
    } catch (e) {
      console.error("Verification error (non-fatal):", e);
    }

    return NextResponse.json({ photoId: insertData.id, status: "created" }, { status: 201 });

  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
