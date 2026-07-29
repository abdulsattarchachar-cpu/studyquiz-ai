import { NextResponse } from "next/server";
import { callGroq, jsonSafeParse } from "../../../lib/groq";

export async function POST(req) {
  try {
    const { notes, type } = await req.json();

    if (!notes || !notes.trim()) {
      return NextResponse.json({ error: "Please provide some notes first." }, { status: 400 });
    }

    const isFlowchart = type === "flowchart";

    const systemContent = isFlowchart
      ? 'Convert the student\'s notes into a step-by-step process/flowchart. Respond ONLY with valid JSON, no markdown: ' +
        '{"root": {"label": "Start", "nodeType": "start", "children": [{"label": "step text", "nodeType": "process", "children": [...]}]}}. ' +
        'Use nodeType "process" for normal steps, "decision" for a branching/conditional step (its children should each have a short "branchLabel" like "Yes"/"No"), and "end" for terminal nodes. Keep labels short (under 10 words). Depth 2-4 levels. Only use this structure if the notes describe a process/sequence — otherwise build a logical step-by-step breakdown of the material.'
      : 'Convert the student\'s notes into a mind map. Respond ONLY with valid JSON, no markdown: ' +
        '{"root": {"label": "Central Topic", "children": [{"label": "Main branch", "children": [{"label": "Sub-point", "children": []}]}]}}. ' +
        "Keep labels short (under 8 words). 2-3 levels deep, 3-6 branches at the top level.";

    const raw = await callGroq(
      [
        { role: "system", content: systemContent },
        { role: "user", content: notes },
      ],
      { temperature: 0.4, max_tokens: 2000 }
    );

    const parsed = jsonSafeParse(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
