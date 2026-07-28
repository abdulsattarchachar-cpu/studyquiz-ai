import Link from "next/link";
import DailyTip from "../components/DailyTip";

const features = [
  {
    href: "/planner",
    title: "Study Planner",
    desc: "Organize your tasks and track what's done, from anywhere.",
    emoji: "🗂️",
  },
  {
    href: "/study-plan",
    title: "Study Plan Generator",
    desc: "Tell AI your subjects and deadline — get a day-wise plan added to your Planner.",
    emoji: "📅",
  },
  {
    href: "/notes",
    title: "AI Notes Summarizer",
    desc: "Summarize notes, switch to ELI5 mode, or translate the output — powered by Groq.",
    emoji: "📝",
  },
  {
    href: "/flashcards",
    title: "Flashcard Generator",
    desc: "Turn any topic into flip-to-reveal flashcards, then convert them into a quiz.",
    emoji: "🃏",
  },
  {
    href: "/quiz",
    title: "Quiz Generator",
    desc: "Type any topic and instantly generate multiple-choice quiz questions.",
    emoji: "🧠",
  },
  {
    href: "/weak-topics",
    title: "Weak Topics Tracker",
    desc: "Missed questions are saved automatically — generate targeted practice for them.",
    emoji: "🎯",
  },
  {
    href: "/essay-grader",
    title: "Essay / Assignment Grader",
    desc: "Paste your writing and get a score with strengths, improvements, and grammar notes.",
    emoji: "✍️",
  },
  {
    href: "/chat",
    title: "Doubt Solver",
    desc: "Ask any study question and get a clear, patient explanation, chat-style.",
    emoji: "💬",
  },
];

export default function Dashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back 👋</h1>
        <p className="text-slate-500 mt-2">
          StudyQuiz AI combines your study planner and AI-powered study tools into one place.
        </p>
      </div>

      <DailyTip />

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {features.map((f) => (
          <Link key={f.href} href={f.href} className="card hover:shadow-md transition block">
            <div className="text-3xl mb-3">{f.emoji}</div>
            <h2 className="font-semibold text-lg text-slate-900">{f.title}</h2>
            <p className="text-slate-500 text-sm mt-1">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
