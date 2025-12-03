import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT =
  "You are an AI inspector. Look at this image. Does it clearly show a power cord plugged into an electrical wall outlet? Return strictly JSON: { is_plugged_in: boolean, reason: string }.";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imageUrl = body?.imageUrl;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Request body must include an imageUrl string." },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: "No response returned from the AI model." },
        { status: 500 }
      );
    }

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Failed to verify plug:", error);
    return NextResponse.json(
      { error: "Failed to verify plug. Please try again." },
      { status: 500 }
    );
  }
}
