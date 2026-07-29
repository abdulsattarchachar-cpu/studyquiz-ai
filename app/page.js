"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ListChecks,
  CalendarRange,
  NotebookText,
  Layers,
  Brain,
  Target,
  PenSquare,
  MessageCircle,
  Flame,
  CheckCircle2,
  BarChart3,
  Calculator,
  Route,
  GraduationCap,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import DailyTip from "../components/DailyTip";
import FeatureCard from "../components/FeatureCard";
import StatCard from "../components/StatCard";
import {
  recordActivity,
  getStreak,
  getActivityLast7Days,
  getQuizStats,
  getFlashcardCount,
  getTasksSummary,
} from "../lib/stats";

const starFeatures = [
  {
    href: "/math-tutor",
    icon: Calculator,
    title: "AI Math Tutor",
    description: "Type an equation or upload a photo — get a full step-by-step teaching solution.",
    stat: "New",
  },
  {
    href: "/learn",
    icon: GraduationCap,
    title: "AI Learning Mode",
    description: "A real AI teacher: concept, examples, practice with feedback, quiz, and homework.",
    stat: "New",
  },
  {
    href: "/roadmap",
    icon: Route,
    title: "AI Roadmap Generator",
    description: "Tell it what you want to learn — get a day-by-day roadmap with resources.",
    stat: "New",
  },
];

const coreFeatures = [
  {
    href: "/planner",
    icon: ListChecks,
    title: "Study Planner",
    description: "Organize your tasks and track what's done, from anywhere.",
  },
  {
    href: "/study-plan",
    icon: CalendarRange,
    title: "Study Plan Generator",
    description: "Tell AI your subjects and deadline — get a day-wise plan added to your Planner.",
  },
  {
    href: "/notes",
    icon: NotebookText,
    title: "AI Notes Summarizer",
    description: "Summarize notes, switch to ELI5 mode, or translate the output.",
  },
  {
    href: "/flashcards",
    icon: Layers,
    title: "Flashcard Generator",
    description: "Turn any topic into flip-to-reveal flashcards, then convert them into a quiz.",
  },
  {
    href: "/quiz",
    icon: Brain,
    title: "Quiz Generator",
    description: "Type any topic and instantly generate multiple-choice quiz questions.",
  },
  {
    href: "/weak-topics",
    icon: Target,
    title: "Weak Topics Tracker",
    description: "Missed questions are saved automatically — generate targeted practice.",
  },
  {
    href: "/essay-grader",
    icon: PenSquare,
    title: "Essay / Assignment Grader",
    description: "Get a score with strengths, improvements, and grammar notes.",
  },
  {
    href: "/chat",
    icon: MessageCircle,
    title: "Doubt Solver",
    description: "Ask any study question and get a clear, patient explanation.",
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    recordActivity();
    const { quizzesTaken, avgAccuracy } = getQuizStats();
    const { completed } = getTasksSummary();
    setStats({
      streak: getStreak(),
      completed,
      quizzesTaken,
      avgAccuracy,
      flashcards: getFlashcardCount(),
    });
    setActivity(getActivityLast7Days());
  }, []);

  return (
    <div>
      {/* Hero with subtle floating gradient blobs */}
      <div className="relative mb-6 overflow-hidden rounded-card">
        <motion.div
          className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-brand-100 opacity-60 blur-3xl"
          animate={{ y: [0, 14, 0], x: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-cyan-100 opacity-50 blur-3xl"
          animate={{ y: [0, -12, 0], x: [0, 10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative py-2"
        >
          <h1 className="text-[30px] font-semibold text-ink-900 tracking-tight">Welcome back 👋</h1>
          <p className="text-ink-600 mt-1.5">
            Everything you need to study smarter, in one place.
          </p>
        </motion.div>
      </div>

      <DailyTip />

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard icon={Flame} label="Study Streak" value={`${stats?.streak ?? 0}d`} loading={!stats} />
        <StatCard icon={CheckCircle2} label="Tasks Done" value={stats?.completed ?? 0} loading={!stats} />
        <StatCard icon={Brain} label="Quizzes Taken" value={stats?.quizzesTaken ?? 0} loading={!stats} />
        <StatCard icon={Layers} label="Flashcards Made" value={stats?.flashcards ?? 0} loading={!stats} />
      </div>

      {/* Activity chart */}
      <div className="card mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-brand-600" size={18} />
          <h2 className="font-semibold text-ink-900">Activity — Last 7 Days</h2>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 1]} />
              <Tooltip
                cursor={{ fill: "#EEF2FF" }}
                formatter={(v) => [v ? "Active" : "No activity", ""]}
                labelStyle={{ color: "#0F172A" }}
              />
              <Bar dataKey="active" fill="#4F6DF5" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Star features */}
      <h2 className="section-title mb-4">✨ Flagship AI Tools</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10">
        {starFeatures.map((f, i) => (
          <motion.div
            key={f.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
          >
            <FeatureCard {...f} />
          </motion.div>
        ))}
      </div>

      {/* Core features */}
      <h2 className="section-title mb-4">Study Tools</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {coreFeatures.map((f, i) => (
          <motion.div
            key={f.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
          >
            <FeatureCard {...f} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
