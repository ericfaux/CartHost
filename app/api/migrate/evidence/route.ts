// app/api/migrate/evidence/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import exifr from "exifr";
import { getSupabaseAdmin } from "../../../../server/supabase-admin";

export const runtime = "nodejs";

const BUCKET = "evidence";
const PAGE_LIMIT = 100;
const WAIT_MS = 120;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Mapping = { rental_id: string | null; cart_id: string | null; host_id: string | null };
type Summary = {
  inserted: number;
  skipped: number;
  dryRuns: number;
  errors: { path: string; message: string; code?: string }[];
};

function isUuid(value?: string | null) {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get("x-cron-secret");
    if (!secret || secret !== process.env.CRON_SECRET) {
      if (!process.env.CRON_SECRET) {
        console.error("[MIGRATE] CRON_SECRET environment variable is not set");
      }
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Initialize admin client at runtime (lazy)
    const supabaseAdmin = getSupabaseAdmin();
    console.info("[MIGRATE] Starting evidence migration...");

    const url = request.nextUrl;
    const dry = url.searchParams.get("dry") === "true" || url.searchParams.get("dry") === "1";
    const onlyFolder = url.searchParams.get("folder") || null;

    async function listFolder(path = "") {
      const results: any[] = [];
      let offset = 0;
      while (true) {
        const { data, error } = await supabaseAdmin.storage.from(BUCKET).list(path, { limit: PAGE_LIMIT, offset });
        if (error) {
          throw error;
        }
        if (!data || data.length === 0) break;
        results.push(...data);
        if (data.length < PAGE_LIMIT) break;
        offset += PAGE_LIMIT;
        await delay(WAIT_MS);
      }
      return results;
    }

    async function existsPhotoByPath(storagePath: string) {
      const resp = await supabaseAdmin.from("photos").select("id").eq("storage_path", storagePath).maybeSingle();
      if ((resp as any).error) throw (resp as any).error;
      return !!(resp as any).data;
    }

    async function inferMapping(folderName: string): Promise<Mapping> {
      const mapping: Mapping = { rental_id: null, cart_id: null, host_id: null };
      if (!isUuid(folderName)) return mapping;

      // rental lookup
      const rentalResp = await supabaseAdmin
        .from("rentals")
        .select("id,cart_id")
        .eq("id", folderName)
        .maybeSingle();

      if ((rentalResp as any).error) {
        console.warn("rental lookup failed", (rentalResp as any).error);
      }
      if ((rentalResp as any).data) {
        const rentalRow = (rentalResp as any).data as { id: string; cart_id: string | null };
        mapping.rental_id = rentalRow.id;
        mapping.cart_id = rentalRow.cart_id;
        if (rentalRow.cart_id) {
          const cartResp = await supabaseAdmin
            .from("carts")
            .select("host_id")
            .eq("id", rentalRow.cart_id)
            .maybeSingle();
          if ((cartResp as any)?.data) {
            mapping.host_id = ((cartResp as any).data as any).host_id ?? null;
          }
        }
        return mapping;
      }

      // cart lookup
      const cartResp = await supabaseAdmin.from("carts").select("id,host_id").eq("id", folderName).maybeSingle();
      if ((cartResp as any)?.data) {
        const cartRow = (cartResp as any).data as { id: string; host_id: string | null };
        mapping.cart_id = cartRow.id;
        mapping.host_id = cartRow.host_id;
        return mapping;
      }

      // host lookup
      const hostResp = await supabaseAdmin.from("hosts").select("id").eq("id", folderName).maybeSingle();
      if ((hostResp as any)?.data) mapping.host_id = ((hostResp as any).data as any).id ?? null;

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
          const code = (sErr as any)?.code || undefined;
          console.warn(`[ERROR] createSignedUrl failed for ${storagePath}: ${message}${code ? ` (code: ${code})` : ""}`);
          summary.errors.push({ path: storagePath, message, code });
          return;
        }

        const signedUrl = signed?.signedUrl;
        if (!signedUrl) {
          const message = "createSignedUrl returned no signedUrl";
          console.warn(`[ERROR] ${message} for ${storagePath}`);
          summary.errors.push({ path: storagePath, message });
          return;
        }

        const res = await fetch(signedUrl);
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
          console.warn(`[WARN] exifr.gps failed for ${storagePath}: ${e?.message ?? String(e)}`);
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
          uploaded_at: storageMeta?.created_at ? new Date(storageMeta.created_at).toISOString() : new Date().toISOString(),
        };

        if (dry) {
          console.log(`[DRY] would insert: ${storagePath} sha=${hash.slice(0, 8)}... inferred=${JSON.stringify(inferred)}`);
          summary.dryRuns += 1;
          return;
        }

        const insertResp = await (supabaseAdmin.from("photos") as any).insert(row).select().single();
        if ((insertResp as any).error || !(insertResp as any).data) {
          const message = (insertResp as any).error?.message || "insert failed";
          const code = (insertResp as any).error?.code || undefined;
          console.error(`[ERROR] insert failed for ${storagePath}: ${message}${code ? ` (code: ${code})` : ""}`);
          summary.errors.push({ path: storagePath, message, code });
          return;
        }

        summary.inserted += 1;
        console.log(`[INSERTED] id=${(insertResp as any).data.id} path=${storagePath} sha=${hash.slice(0, 8)}...`);
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

    console.info(
      `[MIGRATE] Completed. inserted=${summary.inserted} skipped=${summary.skipped} dryRuns=${summary.dryRuns} errors=${summary.errors.length}`
    );

    return NextResponse.json({ ok: true, dry, summary });
  } catch (e: any) {
    console.error("[MIGRATE] Catastrophic failure:", e?.message || e);
    return NextResponse.json({ error: e?.message || "internal error" }, { status: 500 });
  }
}
