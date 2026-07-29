import { NextResponse } from "next/server";
import { callGroq, jsonSafeParse } from "../../../lib/groq";

export async function POST(req) {
  try {
    const { topic, count, difficulty } = await req.json();

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "Please provide a topic or notes." }, { status: 400 });
    }

    const num = Math.min(Math.max(parseInt(count) || 8, 3), 20);

    const raw = await callGroq(
      [
        {
          role: "system",
          content:
            'You are a flashcard generator for students. Respond ONLY with valid JSON, no markdown, no backticks: {"cards": [{"front": "question or term", "back": "concise answer or definition"}]}. Keep each answer short enough to fit on a flashcard (1-3 sentences).',
        },
        {
          role: "user",
          content: `Create ${num} study flashcards about: ${topic}. Difficulty level: ${difficulty || "Medium"}.`,
        },
      ],
      { temperature: 0.5, max_tokens: 2000 }
    );

    const parsed = jsonSafeParse(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
