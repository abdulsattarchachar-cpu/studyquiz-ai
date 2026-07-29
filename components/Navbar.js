"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ListChecks,
  CalendarRange,
  NotebookText,
  Layers,
  Brain,
  Target,
  PenSquare,
  MessageCircle,
  Calculator,
  Route,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planner", label: "Planner", icon: ListChecks },
  { href: "/study-plan", label: "Study Plan", icon: CalendarRange },
  { href: "/roadmap", label: "Roadmap", icon: Route },
  { href: "/notes", label: "Notes", icon: NotebookText },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/quiz", label: "Quiz", icon: Brain },
  { href: "/weak-topics", label: "Weak Topics", icon: Target },
  { href: "/math-tutor", label: "Math Tutor", icon: Calculator },
  { href: "/learn", label: "AI Teacher", icon: GraduationCap },
  { href: "/essay-grader", label: "Essay Grader", icon: PenSquare },
  { href: "/chat", label: "Doubt Solver", icon: MessageCircle },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Brain className="text-white" size={18} />
            </div>
            <span className="text-lg font-semibold text-ink-900">
              StudyQuiz <span className="text-brand-500">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-control text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-50 text-brand-600"
                      : "text-ink-600 hover:bg-slate-100 hover:text-ink-900"
                  }`}
                >
                  <Icon size={16} />
                  <span className="whitespace-nowrap">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="xl:hidden p-2 rounded-control hover:bg-slate-100 min-w-[44px] min-h-[44px]"
            aria-label="Toggle navigation"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="xl:hidden overflow-hidden border-t border-line bg-white"
          >
            <nav className="flex flex-col p-3 gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-control text-sm font-medium min-h-[44px] ${
                      active ? "bg-brand-50 text-brand-600" : "text-ink-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
