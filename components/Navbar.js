"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/planner", label: "Planner" },
  { href: "/notes", label: "Notes Summarizer" },
  { href: "/quiz", label: "Quiz Generator" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
        <Link href="/" className="text-xl font-bold text-brand-600">
          StudyQuiz <span className="text-slate-800">AI</span>
        </Link>
        <nav className="flex gap-2 flex-wrap">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
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
