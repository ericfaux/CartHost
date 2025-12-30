import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import exifr from "exifr";
import getSupabaseAdmin from "../../../../server/supabase-admin";

export const runtime = "nodejs";

const BUCKET = "evidence";
const PAGE_LIMIT = 100;
const WAIT_MS = 120;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Mapping = { rental_id: string | null; cart_id: string | null; host_id: string | null };
type Summary = {
  inserted: number;
  skipped: number;
  dryRuns: number;
  errors: { path: string; message: string }[];
};

function isUuid(value?: string | null) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get("x-cron-secret");
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const url = request.nextUrl;
    const dry = url.searchParams.get("dry") === "true" || url.searchParams.get("dry") === "1";
    const onlyFolder = url.searchParams.get("folder") || null;

    const supabaseAdmin = getSupabaseAdmin();

    async function listFolder(path = "") {
      const results: any[] = [];
      let offset = 0;
      while (true) {
        const { data, error } = await supabaseAdmin.storage
          .from(BUCKET)
          .list(path, { limit: PAGE_LIMIT, offset });
        if (error) throw error;
        if (!data || data.length === 0) break;
        results.push(...data);
        if (data.length < PAGE_LIMIT) break;
        offset += PAGE_LIMIT;
        await delay(WAIT_MS);
      }
      return results;
    }

    async function existsPhotoByPath(storagePath: string) {
      const { data, error } = await supabaseAdmin
        .from("photos")
        .select("id")
        .eq("storage_path", storagePath)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    }

    async function inferMapping(folderName: string): Promise<Mapping> {
      const mapping: Mapping = { rental_id: null, cart_id: null, host_id: null };
      if (!isUuid(folderName)) return mapping;

      const { data: rental } = await supabaseAdmin
        .from("rentals")
        .select("id,cart_id")
        .eq("id", folderName)
        .maybeSingle();
      if (rental) {
        mapping.rental_id = rental.id;
        mapping.cart_id = rental.cart_id;
        if (rental.cart_id) {
          const { data: cart } = await supabaseAdmin
            .from("carts")
            .select("host_id")
            .eq("id", rental.cart_id)
            .maybeSingle();
          if (cart) mapping.host_id = cart.host_id;
        }
        return mapping;
      }

      const { data: cart } = await supabaseAdmin
        .from("carts")
        .select("id,host_id")
        .eq("id", folderName)
        .maybeSingle();
      if (cart) {
        mapping.cart_id = cart.id;
        mapping.host_id = cart.host_id;
        return mapping;
      }

      const { data: host } = await supabaseAdmin
        .from("hosts")
        .select("id")
        .eq("id", folderName)
        .maybeSingle();
      if (host) mapping.host_id = host.id;

      return mapping;
    }

    async function processFile(storagePath: string, storageMeta: any, inferred: Mapping, summary: Summary) {
      try {
        const present = await existsPhotoByPath(storagePath);
        if (present) {
          console.log(`[SKIP] already exists: ${storagePath}`);
          summary.skipped += 1;
          return;
        }

        const { data: signed, error: sErr } = await supabaseAdmin.storage
          .from(BUCKET)
          .createSignedUrl(storagePath, 60);
        if (sErr || !signed) {
          const message = sErr?.message || "failed to sign URL";
          console.warn(`[ERROR] createSignedUrl failed for ${storagePath}: ${message}`);
          summary.errors.push({ path: storagePath, message });
          return;
        }

        const res = await fetch(signed.signedUrl);
        if (!res.ok) {
          const message = `download ${res.status}`;
          console.warn(`[ERROR] download failed for ${storagePath}: ${message}`);
          summary.errors.push({ path: storagePath, message });
          return;
        }
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const hash = crypto.createHash("sha256").update(buffer).digest("hex");

        let gps: any = null;
        try {
          gps = await exifr.gps(buffer);
        } catch (e: any) {
          console.warn(
            `[WARN] exifr.gps failed for ${storagePath}: ${e && e.message ? e.message : String(e)}`
          );
        }

        const row = {
          rental_id: inferred.rental_id,
          cart_id: inferred.cart_id,
          host_id: inferred.host_id,
          storage_path: storagePath,
          file_name: storagePath.split("/").pop() || storagePath,
          mime_type: res.headers.get("content-type") || storageMeta?.content_type || null,
          width: null,
          height: null,
          sha256: hash,
          gps_lat: gps?.latitude ?? null,
          gps_lng: gps?.longitude ?? null,
          gps_altitude:
            gps && typeof gps.altitude === "number"
              ? gps.altitude
              : gps && typeof (gps as any).alt === "number"
                ? (gps as any).alt
                : null,
          kind: "pre_ride",
          verified: true,
          uploader_ip: null,
          uploader_ua: null,
          metadata: { exif: gps ?? null, storage_meta: storageMeta ?? null },
          uploaded_at: storageMeta?.created_at
            ? new Date(storageMeta.created_at).toISOString()
            : new Date().toISOString(),
        };

        if (dry) {
          console.log(
            `[DRY] would insert: ${storagePath} sha=${hash.slice(0, 8)}... inferred=${JSON.stringify(inferred)}`
          );
          summary.dryRuns += 1;
          return;
        }

        const { data: inserted, error: insertErr } = await supabaseAdmin
          .from("photos")
          .insert(row)
          .select()
          .single();
        if (insertErr || !inserted) {
          const message = insertErr?.message || "insert failed";
          console.warn(`[ERROR] insert failed for ${storagePath}: ${message}`);
          summary.errors.push({ path: storagePath, message });
          return;
        }

        summary.inserted += 1;
        console.log(`[INSERTED] id=${inserted.id} path=${storagePath} sha=${hash.slice(0, 8)}...`);
      } catch (err: any) {
        const message = err?.message || String(err);
        console.error(`[EXCEPTION] processing ${storagePath}: ${message}`);
        summary.errors.push({ path: storagePath, message });
      }
    }

    async function walkFolder(path: string, inferredRootMapping: Mapping | null, summary: Summary) {
      const items = await listFolder(path);
      for (const item of items) {
        if (!item?.name) continue;
        const storagePath = path ? `${path}/${item.name}` : item.name;
        const isFile = !!item.metadata;

        if (isFile) {
          const inferred = inferredRootMapping ?? { rental_id: null, cart_id: null, host_id: null };
          await processFile(storagePath, item, inferred, summary);
          await delay(WAIT_MS);
        } else {
          await walkFolder(storagePath, inferredRootMapping, summary);
        }
      }
    }

    const summary: Summary = { inserted: 0, skipped: 0, dryRuns: 0, errors: [] };

    const topEntries = await listFolder("");
    for (const entry of topEntries) {
      if (!entry?.name) continue;
      if (onlyFolder && entry.name !== onlyFolder) continue;

      const entryPath = entry.name;
      const isFile = !!entry.metadata;

      if (isFile) {
        await processFile(entryPath, entry, { rental_id: null, cart_id: null, host_id: null }, summary);
        await delay(WAIT_MS);
      } else {
        console.log(`Starting folder: ${entryPath}`);
        const inferred = await inferMapping(entryPath);
        await walkFolder(entryPath, inferred, summary);
      }
    }

    const responseBody = {
      ok: true,
      dry,
      summary,
    };

    return NextResponse.json(responseBody);
  } catch (e: any) {
    console.error("Migration endpoint failed:", e?.message || e);
    return NextResponse.json({ error: e?.message || "internal error" }, { status: 500 });
  }
}
