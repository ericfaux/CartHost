import crypto from "crypto";
import exifr from "exifr";
import { getSupabaseAdmin } from "../supabase-admin";

/**
 * Download file via signed URL, compute sha256 hex, extract gps metadata using exifr,
 * and update the photos row with authoritative metadata and verified = true.
 *
 * @param storagePath path inside bucket (e.g., "rental_<id>/file.jpg")
 * @param photoId id of photos row to update
 * @param bucket name of bucket (default 'evidence')
 */
export async function verifyAndUpdate(photoId: string, storagePath: string, bucket = "evidence") {
  // Initialize admin client at runtime (lazy)
  const supabaseAdmin = getSupabaseAdmin();

  // Create signed url (short lived)
  const { data: signed, error: sErr } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(storagePath, 60);
  if (sErr || !signed?.signedUrl) {
    throw new Error(`Failed to create signed url for ${storagePath}: ${sErr?.message || "no signed URL returned"}`);
  }

  // Download file
  const res = await fetch(signed.signedUrl);
  if (!res.ok) throw new Error(`Failed to download file for verification: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Compute sha256 hex
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  // Try to parse GPS EXIF
  let gps = null as Awaited<ReturnType<typeof exifr.gps>> | null;
  try {
    gps = await exifr.gps(buffer);
  } catch (err) {
    // non-fatal: continue
    console.warn("exifr parse failed", err);
    gps = null;
  }

  // Defensive altitude extraction:
  // Different exifr versions or camera metadata may expose altitude under
  // `altitude` or `alt`. TypeScript typings may not include `altitude`,
  // so we cast to `any` and probe safely.
  const gpsAltitude = (() => {
    if (!gps) return null;
    const anyGps = gps as any;
    if (typeof anyGps.altitude === "number") return anyGps.altitude;
    if (typeof anyGps.alt === "number") return anyGps.alt;
    return null;
  })();

  // Update photos row
  const update = {
    sha256: hash,
    gps_lat: gps?.latitude ?? null,
    gps_lng: gps?.longitude ?? null,
    gps_altitude: gpsAltitude,
    metadata: { ...(gps ? { gps } : {}), verified_by: "service" },
    verified: true,
  };

  const updateResp = await (supabaseAdmin.from("photos") as any).update(update).eq("id", photoId);
  if ((updateResp as any).error) throw new Error(`Failed to update photos row ${photoId}: ${(updateResp as any).error.message}`);
  return { photoId, hash, gps };
}

export default verifyAndUpdate;
