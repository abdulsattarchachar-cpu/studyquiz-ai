import { NextResponse } from "next/server";
import { callGroq } from "../../../lib/groq";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tip = await callGroq(
      [
        {
          role: "system",
          content:
            "You write short, fresh, non-cheesy study/productivity tips for students. Respond with exactly one tip, 1-2 sentences, no quotation marks, no preamble, no emoji spam (at most one emoji).",
        },
        {
          role: "user",
          content: "Give me today's study tip.",
        },
      ],
      { temperature: 0.9, max_tokens: 120 }
    );

    return NextResponse.json({ tip: tip.trim() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
