import { NextResponse } from "next/server";
import { callGroq, callVision, jsonSafeParse } from "../../../lib/groq";

const MODE_INSTRUCTIONS = {
  eli10:
    "Explain like the student is 10 years old. Use very simple everyday words, short sentences, and simple analogies. Explain every symbol.",
  beginner:
    "Explain for a beginner. Explain every mathematical symbol and term the first time it's used, in plain language.",
  intermediate:
    "Explain at a normal high-school/early-college level. Assume basic familiarity with algebra but still explain reasoning clearly.",
  expert:
    "Be concise. Focus purely on mathematical reasoning and rigor, skip basic explanations a strong student wouldn't need.",
};

const JSON_SHAPE_INSTRUCTIONS =
  'Respond ONLY with valid JSON, no markdown, no backticks, matching exactly this shape: ' +
  '{"problem": "the problem restated, using $...$ for inline math", ' +
  '"whatIsAsked": "plain-language statement of what is being asked", ' +
  '"chapter": "the math topic/chapter this belongs to", ' +
  '"formula": "the key formula needed, using $...$ for math", ' +
  '"whyFormula": "why this formula applies here", ' +
  '"steps": [{"title": "Step 1", "work": "the working for this step, using $...$ for math", "why": "why this step is done"}], ' +
  '"commonMistakes": ["mistake 1", "mistake 2"], ' +
  '"finalAnswer": "the final answer, using $...$ for math", ' +
  '"practiceQuestion": "a similar practice problem for the student to try", ' +
  '"difficulty": "Easy | Medium | Hard", ' +
  '"realLifeExample": "a short real-life scenario where this concept applies"}. ' +
  "Use $...$ delimiters around any mathematical notation inside text fields so it can be rendered properly. Include at least 3 steps for anything non-trivial.";

export async function POST(req) {
  try {
    const { problem, mode, imageBase64 } = await req.json();
    const modeInstruction = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.intermediate;

    let raw;

    if (imageBase64) {
      const prompt =
        `You are an expert math tutor. A student uploaded a photo of a math problem. ` +
        `First read the problem from the image accurately, then solve it fully step by step. ` +
        `${modeInstruction} ${JSON_SHAPE_INSTRUCTIONS}`;
      raw = await callVision(prompt, imageBase64, { temperature: 0.3, max_tokens: 2200 });
    } else {
      if (!problem || !problem.trim()) {
        return NextResponse.json({ error: "Please type a problem or upload a photo." }, { status: 400 });
      }
      raw = await callGroq(
        [
          {
            role: "system",
            content: `You are an expert, patient math tutor who teaches step by step like a real teacher, never just giving the answer. ${modeInstruction} ${JSON_SHAPE_INSTRUCTIONS}`,
          },
          { role: "user", content: `Solve this problem: ${problem}` },
        ],
        { temperature: 0.3, max_tokens: 2200 }
      );
    }

    let parsed;
    try {
      parsed = jsonSafeParse(raw);
    } catch (e) {
      return NextResponse.json(
        { error: "The AI response wasn't valid JSON. Please try again, or rephrase the problem." },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
