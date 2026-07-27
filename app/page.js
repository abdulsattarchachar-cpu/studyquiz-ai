import Link from "next/link";

const features = [
  {
    href: "/planner",
    title: "Study Planner",
    desc: "Organize your tasks and track what's done, from anywhere.",
    emoji: "🗂️",
  },
  {
    href: "/notes",
    title: "AI Notes Summarizer",
    desc: "Paste long notes or lecture text and get a clean summary, powered by Groq.",
    emoji: "📝",
  },
  {
    href: "/quiz",
    title: "Quiz Generator",
    desc: "Type any topic and instantly generate multiple-choice quiz questions.",
    emoji: "🧠",
  },
];

export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back 👋</h1>
        <p className="text-slate-500 mt-2">
          StudyQuiz AI combines your study planner and AI quiz tools into one place.
        </p>
      </div>

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
