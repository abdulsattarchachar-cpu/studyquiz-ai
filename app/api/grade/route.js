import { NextResponse } from "next/server";
import { callGroq, jsonSafeParse } from "../../../lib/groq";

export async function POST(req) {
  try {
    const { text, assignmentType } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Please paste some text to grade." }, { status: 400 });
    }

    const raw = await callGroq(
      [
        {
          role: "system",
          content:
            'You are a supportive but honest writing tutor. Respond ONLY with valid JSON, no markdown, no backticks: ' +
            '{"overallScore": number (0-100), "strengths": ["..."], "improvements": ["..."], "grammarNotes": ["..."], "summary": "short encouraging summary paragraph"}. ' +
            "Be constructive, specific, and reference the actual content when giving feedback.",
        },
        {
          role: "user",
          content: `Assignment type: ${assignmentType || "general essay"}\n\nText to review:\n${text}`,
        },
      ],
      { temperature: 0.4, max_tokens: 1800 }
    );

    const parsed = jsonSafeParse(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
