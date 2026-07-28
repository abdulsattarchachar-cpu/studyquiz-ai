"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/planner", label: "Planner" },
  { href: "/study-plan", label: "Study Plan" },
  { href: "/notes", label: "Notes" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/quiz", label: "Quiz" },
  { href: "/weak-topics", label: "Weak Topics" },
  { href: "/essay-grader", label: "Essay Grader" },
  { href: "/chat", label: "Doubt Solver" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
        <Link href="/" className="text-xl font-bold text-brand-600">
          StudyQuiz <span className="text-slate-800">AI</span>
        </Link>
        <nav className="flex gap-1.5 flex-wrap">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                pathname === link.href
                  ? "bg-brand-500 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
