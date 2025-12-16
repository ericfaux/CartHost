import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const sixteenHoursAgo = new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("rentals")
      .update({ status: "needs_review" })
      .eq("status", "active")
      .lt("created_at", sixteenHoursAgo)
      .select("id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: data?.length ?? 0 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to mark sessions as needs_review." },
      { status: 500 }
    );
  }
}

