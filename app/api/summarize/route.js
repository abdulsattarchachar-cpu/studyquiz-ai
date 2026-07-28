import { NextResponse } from "next/server";
import { callGroq } from "../../../lib/groq";

export async function POST(req) {
  try {
    const { notes, mode, language } = await req.json();

    if (!notes || !notes.trim()) {
      return NextResponse.json({ error: "Please provide some notes to summarize." }, { status: 400 });
    }

    const outputLanguage = language && language !== "Same as input" ? language : null;

    let systemContent;
    if (mode === "eli5") {
      systemContent =
        "You are a friendly teacher explaining things to a complete beginner (Explain Like I'm 5). Take the student's notes and explain the core ideas using very simple language, everyday analogies, and short sentences. Avoid jargon; if you must use a technical term, explain it immediately in plain words.";
    } else {
      systemContent =
        "You are a helpful study assistant. Summarize the student's notes into clear, concise bullet points, highlighting key concepts and definitions. Keep it well-organized and easy to revise from.";
    }

    if (outputLanguage) {
      systemContent += ` Write your entire response in ${outputLanguage}, regardless of the input language.`;
    }

    const summary = await callGroq([
      { role: "system", content: systemContent },
      { role: "user", content: notes },
    ]);

    return NextResponse.json({ summary });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
