import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../../server/supabase-admin";

export const runtime = "nodejs";

const BUCKET = "evidence";
const PAGE_LIMIT = 100;

/**
 * Debug endpoint to quickly check:
 * 1. Environment variables are set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET)
 * 2. Count of files in the evidence bucket
 * 3. Count of rows in the photos table
 *
 * Protected by x-cron-secret header.
 */
export async function GET(request: NextRequest) {
  try {
    const secret = request.headers.get("x-cron-secret");
    if (!secret || secret !== process.env.CRON_SECRET) {
      if (!process.env.CRON_SECRET) {
        console.error("[CHECK] CRON_SECRET environment variable is not set");
      }
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Check environment variables
    const envCheck = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      CRON_SECRET: !!process.env.CRON_SECRET,
    };

    const missingEnvs = Object.entries(envCheck)
      .filter(([, present]) => !present)
      .map(([key]) => key);

    if (missingEnvs.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Missing environment variables: ${missingEnvs.join(", ")}`,
          envCheck,
        },
        { status: 500 }
      );
    }

    // Initialize admin client at runtime (lazy)
    const supabaseAdmin = getSupabaseAdmin();

    // Count files in evidence bucket (paginate to get total)
    let bucketFileCount = 0;
    let offset = 0;
    while (true) {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .list("", { limit: PAGE_LIMIT, offset });
      if (error) {
        return NextResponse.json(
          { ok: false, error: `Failed to list bucket: ${error.message}`, envCheck },
          { status: 500 }
        );
      }
      if (!data || data.length === 0) break;
      // Count files (items with metadata are files, without are folders)
      bucketFileCount += data.filter((item) => !!item.metadata).length;
      // Also count in subfolders - for now just count top-level items
      if (data.length < PAGE_LIMIT) break;
      offset += PAGE_LIMIT;
    }

    // Count rows in photos table
    const { count: photosCount, error: countErr } = await supabaseAdmin
      .from("photos")
      .select("*", { count: "exact", head: true });

    if (countErr) {
      return NextResponse.json(
        { ok: false, error: `Failed to count photos: ${countErr.message}`, envCheck },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      envCheck,
      bucketTopLevelItems: bucketFileCount,
      photosTableCount: photosCount ?? 0,
      note: "bucketTopLevelItems only counts top-level files, not files in subfolders",
    });
  } catch (e: any) {
    console.error("[CHECK] Error:", e?.message || e);
    return NextResponse.json({ ok: false, error: e?.message || "internal error" }, { status: 500 });
  }
}
