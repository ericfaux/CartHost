import crypto from "crypto";
import exifr from "exifr";
import supabaseAdmin from "../supabase-admin";

/**
 * Download file via signed URL, compute sha256 hex, extract gps metadata using exifr,
 * and update the photos row with authoritative metadata and verified = true.
 *
 * @param storagePath path inside bucket (e.g., "rental_<id>/file.jpg")
 * @param photoId id of photos row to update
 * @param bucket name of bucket (default 'evidence')
 */
export async function verifyAndUpdate(photoId: string, storagePath: string, bucket = "evidence") {
  // Create signed url (short lived)
  const { data: signed, error: sErr } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(storagePath, 60);
  if (sErr) {
    throw new Error(`Failed to create signed url for ${storagePath}: ${sErr.message}`);
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

  // Update photos row
  const update = {
    sha256: hash,
    gps_lat: gps?.latitude ?? null,
    gps_lng: gps?.longitude ?? null,
    gps_altitude: gps?.altitude ?? null,
    metadata: { ...(gps ? { gps } : {}), verified_by: "service" },
    verified: true,
  };

  const { error: updErr } = await supabaseAdmin.from("photos").update(update).eq("id", photoId);
  if (updErr) throw new Error(`Failed to update photos row ${photoId}: ${updErr.message}`);
  return { photoId, hash, gps };
}

export default verifyAndUpdate;
