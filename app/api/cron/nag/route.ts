import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSms } from "../../../../lib/sms";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("rentals")
    .select("guest_phone, guest_name")
    .eq("departure_date", today)
    .eq("status", "active");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rentals = data ?? [];

  for (const rental of rentals) {
    const name = rental.guest_name ?? "there";
    await sendSms(
      rental.guest_phone,
      `Hi ${name}! Just a reminder to plug in the golf cart 🔌 and upload the photo to avoid the service fee. Safe travels!`
    );
  }

  return NextResponse.json({ success: true, count: rentals.length });
}
