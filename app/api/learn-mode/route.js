import { NextResponse } from "next/server";
import { callGroq, jsonSafeParse } from "../../../lib/groq";

const STAGE_PROMPTS = {
  introduction: (topic) =>
    `You are a warm, encouraging teacher starting a new lesson. Give a short introduction (3-5 sentences) to "${topic}" — what it is and why it matters. Do not teach the full concept yet, just introduce it.`,
  prerequisites: (topic) =>
    `List 3-5 prerequisite concepts a student should already know before learning "${topic}". For each, give a one-line reminder of what it means. Format as a simple bullet list.`,
  concept: (topic, transcript) =>
    `Continuing the lesson on "${topic}" (prior context: ${transcript}), now teach the core concept clearly and thoroughly, like a real teacher explaining on a whiteboard. Use short paragraphs and simple structure. Do not include practice questions yet.`,
  example: (topic, transcript) =>
    `Continuing the lesson on "${topic}" (prior context: ${transcript}), give ONE clear worked example that illustrates the concept, explained step by step.`,
  practice1: (topic, transcript) =>
    `Continuing the lesson on "${topic}" (prior context: ${transcript}), give the student ONE practice question to attempt on their own, matching what's been taught so far. Do NOT include the answer or solution — just the question.`,
  practice2: (topic, transcript) =>
    `Continuing the lesson on "${topic}" (prior context: ${transcript}), give the student a SECOND, slightly harder practice question. Do NOT include the answer — just the question.`,
  revisionNotes: (topic, transcript) =>
    `Based on this full lesson on "${topic}" (${transcript}), write concise revision notes as a bullet list covering all key points taught.`,
  homework: (topic, transcript) =>
    `Based on this lesson on "${topic}" (${transcript}), give 2-3 homework questions of increasing difficulty, without answers, for the student to practice later.`,
  finalAssessment: (topic, transcript) =>
    `Based on this full lesson on "${topic}" (${transcript}), give a short final assessment: 2 questions that test deep understanding (not just recall), without answers. End with a short encouraging closing note congratulating the student on completing the lesson.`,
};

async function getPlainStageContent(stage, topic, transcript) {
  const promptFn = STAGE_PROMPTS[stage];
  const prompt = promptFn(topic, transcript);
  const content = await callGroq(
    [
      {
        role: "system",
        content:
          "You are an excellent, patient AI teacher guiding a student through a structured lesson, one stage at a time. Keep responses focused and not overly long.",
      },
      { role: "user", content: prompt },
    ],
    { temperature: 0.5, max_tokens: 900 }
  );
  return content;
}

export async function POST(req) {
  try {
    const { action, topic, stage, transcript, studentAnswer, practiceQuestion, wrongQuestions } =
      await req.json();

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "Please tell me what you want to learn." }, { status: 400 });
    }

    const transcriptText = (transcript || []).join(" | ").slice(0, 4000);

    if (action === "evaluate_practice") {
      const feedback = await callGroq(
        [
          {
            role: "system",
            content:
              "You are a supportive teacher giving feedback on a student's practice attempt. Be honest about correctness but encouraging. Keep it to 2-4 sentences, then show the correct approach briefly if they made a mistake.",
          },
          {
            role: "user",
            content: `Topic: ${topic}\nQuestion asked: ${practiceQuestion}\nStudent's answer: ${studentAnswer}\n\nEvaluate this and give feedback.`,
          },
        ],
        { temperature: 0.4, max_tokens: 500 }
      );
      return NextResponse.json({ content: feedback });
    }

    if (stage === "quiz") {
      const raw = await callGroq(
        [
          {
            role: "system",
            content:
              'Respond ONLY with valid JSON, no markdown: {"questions": [{"question": "string", "options": ["A","B","C","D"], "correctIndex": 0}]}. Generate exactly 3 multiple-choice questions.',
          },
          {
            role: "user",
            content: `Generate a 3-question quiz testing understanding of "${topic}", based on this lesson: ${transcriptText}`,
          },
        ],
        { temperature: 0.5, max_tokens: 1200 }
      );
      const parsed = jsonSafeParse(raw);
      return NextResponse.json(parsed);
    }

    if (stage === "weakPoints") {
      const content = await callGroq(
        [
          {
            role: "system",
            content:
              "You are a teacher reviewing a student's quiz results. Briefly explain what to revisit based on what they got wrong, in an encouraging tone.",
          },
          {
            role: "user",
            content:
              wrongQuestions && wrongQuestions.length > 0
                ? `Topic: ${topic}\nThe student missed these questions:\n${wrongQuestions.join("\n")}\n\nExplain what to revisit.`
                : `Topic: ${topic}\nThe student got everything right on the quiz! Give a short congratulatory note and suggest what to explore next.`,
          },
        ],
        { temperature: 0.5, max_tokens: 500 }
      );
      return NextResponse.json({ content });
    }

    if (!STAGE_PROMPTS[stage]) {
      return NextResponse.json({ error: `Unknown stage: ${stage}` }, { status: 400 });
    }

    const content = await getPlainStageContent(stage, topic, transcriptText);
    return NextResponse.json({ content });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong." }, { status: 500 });
  }
}
