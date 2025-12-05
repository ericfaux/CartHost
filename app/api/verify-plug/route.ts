import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
// FIX: Go up 3 levels to find the root lib folder
import { sendSms } from "../../../lib/sms";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT =
  "You are an AI inspector. Look at this image. Does it show a power cord plugged into an electrical wall outlet? Don't be too strict with your judgement, if its close then pass it. Return strictly JSON: { is_plugged_in: boolean, reason: string }.";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, rentalId } = body ?? {};

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Request body must include an imageUrl string." },
        { status: 400 }
      );
    }

    // 1. OpenAI Vision Check
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Inspect this image and respond with JSON." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No AI response." }, { status: 500 });
    }

    const result = JSON.parse(content);

    // 2. If Plugged In, Send SMS
    if (result.is_plugged_in && rentalId) {
      const cookieStore = await cookies();
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return cookieStore.getAll() },
            setAll(cookiesToSet) {
                 try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
            },
          },
        }
      );

      const { data: rental } = await supabase
        .from('rentals')
        .select('guest_phone')
        .eq('id', rentalId)
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
