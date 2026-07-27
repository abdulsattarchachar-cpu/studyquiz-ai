import { NextResponse } from "next/server";
import { callGroq } from "../../../lib/groq";

export async function POST(req) {
  try {
    const { notes } = await req.json();

    if (!notes || !notes.trim()) {
      return NextResponse.json({ error: "Please provide some notes to summarize." }, { status: 400 });
    }

    const summary = await callGroq([
      {
        role: "system",
        content:
          "You are a helpful study assistant. Summarize the student's notes into clear, concise bullet points, highlighting key concepts and definitions. Keep it well-organized and easy to revise from.",
      },
      { role: "user", content: notes },
    ]);

    return NextResponse.json({ summary });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
