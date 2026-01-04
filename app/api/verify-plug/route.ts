import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "../../../server/supabase-admin";
import { sendSms } from "../../../lib/sms";

const SYSTEM_PROMPT =
  "You are an AI inspector. Look at this image. Does it show a power cord plugged into an electrical wall outlet? Don't be too strict with your judgement, if its close then pass it. Return strictly JSON: { is_plugged_in: boolean, reason: string }.";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY configuration." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const body = await req.json();
    const { storagePath, rentalId } = body ?? {};

    // Validate storagePath is provided
    if (!storagePath || typeof storagePath !== "string") {
      return NextResponse.json(
        { error: "Request body must include a storagePath string." },
        { status: 400 }
      );
    }

    // 1. Authenticate the caller
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // 2. Authorize: validate storagePath ownership
    // Path format: cartId/userId/... or cartId/userId/rentalId/...
    const segments = storagePath.split("/");
    if (segments.length < 3) {
      return NextResponse.json(
        { error: "Invalid storage path format." },
        { status: 400 }
      );
    }

    // userId must be the 2nd segment (index 1)
    const pathUserId = segments[1];
    if (pathUserId !== user.id) {
      return NextResponse.json(
        { error: "Access denied: path does not belong to authenticated user." },
        { status: 403 }
      );
    }

    // 3. Generate signed URL using service role client
    const supabaseAdmin = getSupabaseAdmin();
    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from("evidence")
      .createSignedUrl(storagePath, 300); // 5 minute expiry

    if (signError || !signedData?.signedUrl) {
      console.error("Failed to create signed URL:", signError);
      return NextResponse.json(
        { error: "Failed to generate signed URL for image." },
        { status: 500 }
      );
    }

    // 4. OpenAI Vision Check using signed URL (do NOT log the signed URL)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Inspect this image and respond with JSON." },
            { type: "image_url", image_url: { url: signedData.signedUrl } },
          ],
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No AI response." }, { status: 500 });
    }

    const result = JSON.parse(content);

    // 5. If Plugged In, Send SMS
    if (result.is_plugged_in && rentalId) {
      const { data: rental } = await supabase
        .from("rentals")
        .select("guest_phone")
        .eq("id", rentalId)
        .single();

      if (rental?.guest_phone) {
        await sendSms(
          rental.guest_phone,
          "Thanks for plugging in! 🔌 Your rental session is now closed. Safe travels!"
        );
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Verify plug error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify plug." },
      { status: 500 }
    );
  }
}
