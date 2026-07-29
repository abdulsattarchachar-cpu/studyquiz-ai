import { NextResponse } from "next/server";
import { callGroq } from "../../../lib/groq";

export async function POST(req) {
  try {
    const { topic, numQuestions, context, difficulty } = await req.json();

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "Please provide a topic." }, { status: 400 });
    }

    const count = Math.min(Math.max(parseInt(numQuestions) || 5, 1), 15);

    const userContent = context
      ? `Base the questions strictly on this study material about "${topic}":\n\n${context}\n\nGenerate ${count} multiple-choice questions from it. Difficulty: ${difficulty || "Medium"}.`
      : `Generate ${count} multiple-choice quiz questions about: ${topic}. Difficulty: ${difficulty || "Medium"}.`;

    const raw = await callGroq(
      [
        {
          role: "system",
          content:
            "You are a quiz generator. Respond ONLY with valid JSON and nothing else — no markdown, no backticks, no preamble. " +
            'The JSON must match this exact shape: {"questions": [{"question": "string", "options": ["A", "B", "C", "D"], "correctIndex": 0}]}. ' +
            "Each question must have exactly 4 options and correctIndex must be the 0-based index of the correct option.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      { temperature: 0.5, max_tokens: 2000 }
    );

    let parsed;
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      return NextResponse.json(
        { error: "The AI response wasn't valid JSON. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
