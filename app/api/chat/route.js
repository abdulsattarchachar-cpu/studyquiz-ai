import { NextResponse } from "next/server";
import { callGroq } from "../../../lib/groq";

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const systemPrompt = {
      role: "system",
      content:
        "You are a friendly, patient study doubt-solving assistant for students. Explain concepts clearly and simply, use short examples where helpful, and keep answers focused and not overly long. If the student's question is ambiguous, make a reasonable assumption and answer directly.",
    };

    const reply = await callGroq([systemPrompt, ...messages], {
      temperature: 0.5,
      max_tokens: 1200,
    });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
