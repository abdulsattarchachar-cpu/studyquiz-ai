import { NextResponse } from "next/server";
import { callGroq, jsonSafeParse } from "../../../lib/groq";

export async function POST(req) {
  try {
    const { subjects, days, details, dailyHours, difficulty } = await req.json();

    if (!subjects || !subjects.trim()) {
      return NextResponse.json({ error: "Please list the subjects/topics to cover." }, { status: 400 });
    }

    const numDays = Math.min(Math.max(parseInt(days) || 7, 1), 60);
    const hoursPerDay = dailyHours ? Math.min(Math.max(parseFloat(dailyHours), 0.5), 16) : 3;

    const raw = await callGroq(
      [
        {
          role: "system",
          content:
            'You are a study planning assistant. Respond ONLY with valid JSON, no markdown, no backticks: {"plan": [{"day": 1, "focus": "short title", "estimatedHours": number, "priority": "Low"|"Medium"|"High", "tasks": ["task 1", "task 2"]}]}. ' +
            "Distribute topics realistically across the given number of days and daily hours available, mixing learning, revision, and practice. Include a light review day near the end if there are enough days. Set priority based on how close the day is to the deadline and how critical the topic is.",
        },
        {
          role: "user",
          content: `Subjects/topics to cover: ${subjects}\nNumber of days available: ${numDays}\nHours available per day: ${hoursPerDay}\nDifficulty level: ${difficulty || "Medium"}\nExtra context: ${details || "none"}`,
        },
      ],
      { temperature: 0.5, max_tokens: 2500 }
    );

    const parsed = jsonSafeParse(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
