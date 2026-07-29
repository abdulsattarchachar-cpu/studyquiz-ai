import { NextResponse } from "next/server";
import { callGroq, jsonSafeParse } from "../../../lib/groq";

export async function POST(req) {
  try {
    const { goal, totalDays, hoursPerDay } = await req.json();

    if (!goal || !goal.trim()) {
      return NextResponse.json({ error: "Please tell me what you want to learn." }, { status: 400 });
    }

    const days = Math.min(Math.max(parseInt(totalDays) || 90, 7), 365);
    const hours = Math.min(Math.max(parseFloat(hoursPerDay) || 1, 0.5), 8);

    const raw = await callGroq(
      [
        {
          role: "system",
          content:
            'You are an expert learning coach who designs realistic, structured learning roadmaps. Respond ONLY with valid JSON, no markdown, no backticks: ' +
            '{"totalDays": number, "overview": "1-2 sentence overview of the roadmap", ' +
            '"weeks": [{"week": 1, "goal": "short weekly goal", "days": [{"day": 1, "tasks": ["task 1", "task 2"], "resources": ["free resource or resource type suggestion"]}]}], ' +
            '"finalQuizTopics": ["topic to quiz on"], "revisionTips": ["tip 1", "tip 2"]}. ' +
            "Group days into weeks (7 days per week). Keep daily tasks realistic for the given hours/day. Suggest resource TYPES (official docs, YouTube series, practice site) rather than fake specific URLs unless they are extremely well-known and stable (e.g. official language docs).",
        },
        {
          role: "user",
          content: `Learning goal: ${goal}\nTotal days available: ${days}\nHours available per day: ${hours}`,
        },
      ],
      { temperature: 0.5, max_tokens: 3000 }
    );

    const parsed = jsonSafeParse(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
