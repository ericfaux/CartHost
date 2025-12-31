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
const FETCH_RETRIES = 3;
const RETRY_DELAY_MS = 500;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Mapping = { rental_id: string | null; cart_id: string | null; host_id: string | null };
type Summary = {
  inserted: number;
  skipped: number;
  dryRuns: number;
  errors: { path: string; message: string; code?: string }[];
};

/**
 * Merges a parent mapping with a child mapping.
 * Only fills in missing IDs from the child - never overwrites existing parent values with null.
 */
function mergeMapping(parent: Mapping | null, child: Mapping): Mapping {
  const base: Mapping = parent
    ? { ...parent }
    : { rental_id: null, cart_id: null, host_id: null };

  // Only fill in if parent doesn't have a value and child does
  if (!base.rental_id && child.rental_id) {
    base.rental_id = child.rental_id;
  }
  if (!base.cart_id && child.cart_id) {
    base.cart_id = child.cart_id;
  }
  if (!base.host_id && child.host_id) {
    base.host_id = child.host_id;
  }

  return base;
}

/**
 * Fetches a URL with retry logic.
 * @returns Response on success, or null after all retries exhausted
 */
async function fetchWithRetry(
  url: string,
  retries: number = FETCH_RETRIES,
  delayMs: number = RETRY_DELAY_MS
): Promise<Response | null> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return res;
      }
      // Non-ok response - treat as retriable error
      lastError = new Error(`HTTP ${res.status}: ${res.statusText}`);
      console.warn(`[RETRY] Attempt ${attempt}/${retries} failed: ${lastError.message}`);
    } catch (err: any) {
      lastError = err;
      console.warn(`[RETRY] Attempt ${attempt}/${retries} network error: ${err?.message || err}`);
    }

    if (attempt < retries) {
      await delay(delayMs);
    }
  }

  console.error(`[RETRY] All ${retries} attempts exhausted. Last error: ${lastError?.message || "unknown"}`);
  return null;
}

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
      if (!folderName) return mapping;

      // 1) Try to find a UUID anywhere in the folder name
      const uuidMatch = folderName.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}/i);
      let candidate: string | null = uuidMatch ? uuidMatch[0] : null;

      // 2) If nothing found, split on common separators and look for a UUID piece
      if (!candidate) {
        const pieces = folderName.split(/[_\-.\/]/);
        for (const p of pieces) {
          if (isUuid(p)) {
            candidate = p;
            break;
          }
        }
      }

      // 3) If we have a candidate UUID, try rental/cart/host lookups with it
      if (candidate) {
        try {
          const rentalResp = await supabaseAdmin
            .from("rentals")
            .select("id,cart_id")
            .eq("id", candidate)
            .maybeSingle();
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
              if ((cartResp as any)?.data) mapping.host_id = ((cartResp as any).data as any).host_id ?? null;
            }
            console.info(`[MIGRATE] inferMapping found rental candidate=${candidate} for folder=${folderName}`);
            return mapping;
          }

          const cartResp = await supabaseAdmin.from("carts").select("id,host_id").eq("id", candidate).maybeSingle();
          if ((cartResp as any)?.data) {
            mapping.cart_id = (cartResp as any).data.id;
            mapping.host_id = (cartResp as any).data.host_id;
            console.info(`[MIGRATE] inferMapping found cart candidate=${candidate} for folder=${folderName}`);
            return mapping;
          }

          const hostResp = await supabaseAdmin.from("hosts").select("id").eq("id", candidate).maybeSingle();
          if ((hostResp as any)?.data) {
            mapping.host_id = (hostResp as any).data.id;
            console.info(`[MIGRATE] inferMapping found host candidate=${candidate} for folder=${folderName}`);
            return mapping;
          }
        } catch (err: any) {
          console.warn(`[MIGRATE] inferMapping lookup error for candidate=${candidate} folder=${folderName}:`, err?.message || err);
          // continue to fallback logic
        }
      }

      // 4) Fallback: if folderName is a raw UUID, try the existing exact-match workflow
      if (isUuid(folderName)) {
        try {
          const rentalResp = await supabaseAdmin
            .from("rentals")
            .select("id,cart_id")
            .eq("id", folderName)
            .maybeSingle();
          if ((rentalResp as any)?.data) {
            const rentalRow = (rentalResp as any).data as { id: string; cart_id: string | null };
            mapping.rental_id = rentalRow.id;
            mapping.cart_id = rentalRow.cart_id;
            if (rentalRow.cart_id) {
              const cartResp = await supabaseAdmin
                .from("carts")
                .select("host_id")
                .eq("id", rentalRow.cart_id)
                .maybeSingle();
              if ((cartResp as any)?.data) mapping.host_id = ((cartResp as any).data as any).host_id ?? null;
            }
            console.info(`[MIGRATE] inferMapping fallback (exact UUID) for folder=${folderName}`);
            return mapping;
          }
        } catch (err: any) {
          console.warn(`[MIGRATE] inferMapping fallback error folder=${folderName}:`, err?.message || err);
        }
      }

      // nothing found
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
          console.error(`[CRITICAL SIGNING ERROR] createSignedUrl failed for ${storagePath}: ${message}${code ? ` (code: ${code})` : ""}`);
          summary.errors.push({ path: storagePath, message: `Critical Signing Error: ${message}`, code });
          return;
        }

        const signedUrl = signed?.signedUrl;
        if (!signedUrl) {
          const message = "createSignedUrl returned no signedUrl";
          console.error(`[CRITICAL SIGNING ERROR] ${message} for ${storagePath}`);
          summary.errors.push({ path: storagePath, message: `Critical Signing Error: ${message}` });
          return;
        }

        const res = await fetchWithRetry(signedUrl);
        if (!res) {
          const message = `download failed after ${FETCH_RETRIES} retries`;
          console.error(`[ERROR] ${message} for ${storagePath}`);
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
          // Start with parent folder's inferred mapping
          let inferred = inferredRootMapping ?? { rental_id: null, cart_id: null, host_id: null };

          // Attempt to infer mapping from the filename itself (e.g., "rental-uuid-front.jpg")
          // This handles flat file structures where UUID is in filename instead of folder
          try {
            const filenameMapping = await inferMapping(item.name);
            // Merge filename mapping with parent mapping (only fills in missing IDs)
            inferred = mergeMapping(inferred, filenameMapping);
          } catch (err: any) {
            console.warn(`[MIGRATE] inferMapping for filename ${item.name} failed: ${err?.message || err}`);
          }

          await processFile(storagePath, item, inferred, summary);
          await delay(WAIT_MS);
        } else {
          // Always try to infer mapping from the current folder name
          // Then merge with parent mapping (only filling in missing IDs)
          let childMapping: Mapping;
          try {
            const inferredForChild = await inferMapping(item.name);
            // Merge: parent mapping + current folder's inferred data
            // Only fills in missing IDs - never overwrites existing parent values with null
            childMapping = mergeMapping(inferredRootMapping, inferredForChild);
          } catch (err: any) {
            console.warn(`[MIGRATE] inferMapping for child folder ${item.name} failed: ${err?.message || err}`);
            childMapping = inferredRootMapping ?? { rental_id: null, cart_id: null, host_id: null };
          }
          await walkFolder(storagePath, childMapping, summary);
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
