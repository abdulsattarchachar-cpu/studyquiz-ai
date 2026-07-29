"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  ArrowRight,
  X,
  TrendingUp,
  Award,
  Zap,
  Clock,
  BookOpen,
  Layers as LayersIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import DailyTip from "../components/DailyTip";
import FeatureCard from "../components/FeatureCard";
import StatCard from "../components/StatCard";
import CircularProgress from "../components/CircularProgress";
import Confetti from "../components/Confetti";
import {
  recordActivity,
  getStreak,
  getActivityLast7Days,
  getQuizStats,
  getQuizAccuracyTrend,
  getFlashcardCount,
  getTasksSummary,
  getTodayTasks,
  getSubjectProgress,
  getUpcomingExams,
  getRecentActivity,
  getContinueLearning,
  getAchievements,
  getAIQuestionsAsked,
} from "../lib/stats";

const TASKS_KEY = "studyquiz_tasks";
const WEAK_TOPICS_KEY = "studyquiz_weak_topics";

const starFeatures = [
  { href: "/math-tutor", icon: Calculator, title: "AI Math Tutor", description: "Type an equation or upload a photo — get a full step-by-step teaching solution.", stat: "Flagship" },
  { href: "/learn", icon: GraduationCap, title: "AI Learning Mode", description: "A real AI teacher: concept, examples, practice with feedback, quiz, and homework.", stat: "Flagship" },
  { href: "/roadmap", icon: Route, title: "AI Roadmap Generator", description: "Tell it what you want to learn — get a day-by-day roadmap with resources.", stat: "Flagship" },
];

const coreFeatures = [
  { href: "/planner", icon: ListChecks, title: "Study Planner", description: "Organize your tasks and track what's done, from anywhere." },
  { href: "/study-plan", icon: CalendarRange, title: "Study Plan Generator", description: "Tell AI your subjects and deadline — get a day-wise plan added to your Planner." },
  { href: "/notes", icon: NotebookText, title: "AI Notes Summarizer", description: "Summarize notes, switch to ELI5 mode, translate, or view as a mind map / flowchart." },
  { href: "/flashcards", icon: Layers, title: "Flashcard Generator", description: "Turn any topic into flip-to-reveal flashcards, then convert them into a quiz." },
  { href: "/quiz", icon: Brain, title: "Quiz Generator", description: "Type any topic and instantly generate multiple-choice quiz questions." },
  { href: "/weak-topics", icon: Target, title: "Weak Topics Tracker", description: "Missed questions are saved automatically — generate targeted practice." },
  { href: "/essay-grader", icon: PenSquare, title: "Essay / Assignment Grader", description: "Get a score with strengths, improvements, and grammar notes." },
  { href: "/chat", icon: MessageCircle, title: "Doubt Solver", description: "Ask any study question and get a clear, patient explanation." },
];

const ACTIVITY_ICONS = {
  quiz: Brain,
  flashcards: Layers,
  notes: NotebookText,
  "study-plan": CalendarRange,
  roadmap: Route,
  learn: GraduationCap,
  chat: MessageCircle,
};

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [accuracyTrend, setAccuracyTrend] = useState([]);
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [continueLearning, setContinueLearningState] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [achievements, setAchievements] = useState(null);
  const [dismissedRec, setDismissedRec] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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
      aiQuestions: getAIQuestionsAsked(),
    });
    setActivity(getActivityLast7Days());
    setAccuracyTrend(getQuizAccuracyTrend());
    setSubjectProgress(getSubjectProgress());
    setTodayTasks(getTodayTasks());
    setContinueLearningState(getContinueLearning());
    setUpcomingExams(getUpcomingExams());
    setRecentActivity(getRecentActivity());

    try {
      const wt = JSON.parse(localStorage.getItem(WEAK_TOPICS_KEY) || "[]");
      const byTopic = {};
      wt.forEach((e) => {
        byTopic[e.topic] = (byTopic[e.topic] || 0) + e.wrongCount;
      });
      setWeakTopics(
        Object.entries(byTopic)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([topic, count]) => ({ topic, count }))
      );
    } catch (e) {
      setWeakTopics([]);
    }

    const ach = getAchievements();
    setAchievements(ach);
    if (ach.newlyUnlocked.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
  }, []);

  function toggleTodayTask(id) {
    let tasks = [];
    try {
      tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
    } catch (e) {
      tasks = [];
    }
    const updated = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    localStorage.setItem(TASKS_KEY, JSON.stringify(updated));
    setTodayTasks(getTodayTasks());
  }

  const topWeak = weakTopics[0];
  const weakestSubject = subjectProgress.length
    ? [...subjectProgress].sort((a, b) => a.mastery - b.mastery)[0]
    : null;

  return (
    <div>
      {showConfetti && <Confetti count={36} />}

      {/* Hero */}
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
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {todayTasks.length > 0 &&
              ` — you've completed ${todayTasks.filter((t) => t.done).length}/${todayTasks.length} tasks today.`}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link href={continueLearning ? `/learn?topic=${encodeURIComponent(continueLearning.topic)}` : "/learn"} className="btn-primary text-sm">
              <GraduationCap size={15} /> Continue Learning
            </Link>
            <Link href="/quiz" className="btn-secondary text-sm">
              <Brain size={15} /> Generate Quiz
            </Link>
            <Link href="/chat" className="btn-secondary text-sm">
              <MessageCircle size={15} /> Ask AI
            </Link>
          </div>
        </motion.div>
      </div>

      {/* AI Smart Recommendation */}
      <AnimatePresence>
        {!dismissedRec && (topWeak || weakestSubject) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="rounded-card border border-brand-100 bg-brand-50 p-5 mb-6 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-control bg-white flex items-center justify-center shrink-0 shadow-soft">
              <Sparkles className="text-brand-600" size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-brand-600 tracking-wide mb-1">🤖 AI RECOMMENDATION</p>
              <p className="text-sm text-ink-900 mb-3">
                {topWeak
                  ? `You've missed ${topWeak.count} question${topWeak.count > 1 ? "s" : ""} on "${topWeak.topic}" recently — worth a focused revision round before moving on.`
                  : `Your accuracy on "${weakestSubject.topic}" is around ${weakestSubject.mastery}% — a quick revision could help before you move to something new.`}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link href="/weak-topics" className="btn-primary !min-h-0 !py-1.5 !px-3 text-xs">
                  Start Revision
                </Link>
                <Link href="/quiz" className="btn-secondary !min-h-0 !py-1.5 !px-3 text-xs">
                  Generate Practice Quiz
                </Link>
                <button
                  onClick={() => setDismissedRec(true)}
                  className="btn-secondary !min-h-0 !py-1.5 !px-3 text-xs !bg-transparent"
                >
                  <X size={12} /> Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DailyTip />

      {/* Quick stats — 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        <StatCard icon={Flame} label="Study Streak" value={stats?.streak ?? 0} suffix="d" progress={stats ? Math.min(100, (stats.streak / 7) * 100) : 0} loading={!stats} />
        <StatCard icon={CheckCircle2} label="Tasks Done" value={stats?.completed ?? 0} progress={stats ? Math.min(100, (stats.completed / 20) * 100) : 0} loading={!stats} />
        <StatCard icon={Brain} label="Quizzes Taken" value={stats?.quizzesTaken ?? 0} progress={stats ? Math.min(100, (stats.quizzesTaken / 20) * 100) : 0} loading={!stats} />
        <StatCard icon={TrendingUp} label="Quiz Accuracy" value={stats?.avgAccuracy ?? 0} suffix="%" progress={stats?.avgAccuracy ?? 0} loading={!stats} />
        <StatCard icon={Layers} label="Flashcards Made" value={stats?.flashcards ?? 0} progress={stats ? Math.min(100, (stats.flashcards / 50) * 100) : 0} loading={!stats} />
        <StatCard icon={MessageCircle} label="AI Questions Asked" value={stats?.aiQuestions ?? 0} progress={stats ? Math.min(100, (stats.aiQuestions / 20) * 100) : 0} loading={!stats} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        {/* Today's Plan */}
        <div className="card lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-brand-600" size={17} />
            <h2 className="font-semibold text-ink-900 text-sm">Today's Plan</h2>
          </div>
          {todayTasks.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No tasks due today. <Link href="/planner" className="text-brand-600 hover:underline">Add one →</Link>
            </p>
          ) : (
            <div className="space-y-2">
              {(() => {
                const firstIncompleteIndex = todayTasks.findIndex((t) => !t.done);
                return todayTasks.map((t, i) => {
                  const isCurrent = i === firstIncompleteIndex;
                  return (
                    <label
                      key={t.id}
                      className={`flex items-center gap-2 p-2 rounded-control cursor-pointer transition-colors ${
                        isCurrent ? "bg-brand-50 ring-1 ring-brand-200" : "hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => toggleTodayTask(t.id)}
                        className="w-4 h-4 accent-brand-500 shrink-0"
                      />
                      <span className={`text-sm truncate ${t.done ? "line-through text-slate-400" : "text-ink-900"}`}>
                        {t.title}
                      </span>
                    </label>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Continue Learning */}
        <div className="card lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-brand-600" size={17} />
            <h2 className="font-semibold text-ink-900 text-sm">Continue Learning</h2>
          </div>
          {continueLearning ? (
            <div>
              <p className="font-medium text-ink-900 text-sm mb-1">{continueLearning.topic}</p>
              <p className="text-xs text-ink-600 mb-3">
                Stage: {continueLearning.stageLabel} ({continueLearning.stageIndex + 1}/{continueLearning.totalStages})
              </p>
              <div className="h-1.5 bg-slate-100 rounded-pill mb-3 overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-pill"
                  style={{ width: `${Math.round((continueLearning.stageIndex / continueLearning.totalStages) * 100)}%` }}
                />
              </div>
              <Link href={`/learn?topic=${encodeURIComponent(continueLearning.topic)}`} className="btn-primary text-xs !py-1.5">
                Resume Lesson <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              No lesson in progress. <Link href="/learn" className="text-brand-600 hover:underline">Start one →</Link>
            </p>
          )}
        </div>

        {/* AI Math Tutor highlight */}
        <Link href="/math-tutor" className="lg:col-span-1">
          <motion.div
            whileHover={{ y: -3 }}
            className="card h-full !bg-gradient-to-br !from-brand-500 !to-brand-700 text-white border-0"
          >
            <div className="w-10 h-10 rounded-control bg-white/20 flex items-center justify-center mb-3">
              <Calculator size={18} />
            </div>
            <h2 className="font-semibold mb-1">AI Math Tutor</h2>
            <p className="text-sm text-white/80 mb-3">
              Understand every step instead of just getting the answer.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/20 rounded-pill px-3 py-1.5">
              Type or upload a photo <ArrowRight size={12} />
            </span>
          </motion.div>
        </Link>
      </div>

      {/* Study Analytics */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-brand-600" size={18} />
            <h2 className="font-semibold text-ink-900 text-sm">Activity — Last 7 Days</h2>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 1]} />
                <Tooltip cursor={{ fill: "#EEF2FF" }} formatter={(v) => [v ? "Active" : "No activity", ""]} labelStyle={{ color: "#0F172A" }} />
                <Bar dataKey="active" fill="#4F6DF5" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-brand-600" size={18} />
            <h2 className="font-semibold text-ink-900 text-sm">Quiz Accuracy Trend</h2>
          </div>
          {accuracyTrend.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
              Take a quiz to see your accuracy trend here.
            </div>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`${v}%`, "Accuracy"]} labelStyle={{ color: "#0F172A" }} />
                  <Line type="monotone" dataKey="accuracy" stroke="#4F6DF5" strokeWidth={2.5} dot={{ r: 3, fill: "#4F6DF5" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Subject Progress */}
      <div className="card mb-8">
        <h2 className="font-semibold text-ink-900 text-sm mb-4">Subject Progress</h2>
        {subjectProgress.length === 0 ? (
          <p className="text-slate-400 text-sm">
            Take a few quizzes on different topics and your subject mastery will show up here.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {subjectProgress.map((s) => (
              <div key={s.topic} className="flex flex-col items-center text-center gap-2">
                <CircularProgress percent={s.mastery} />
                <p className="text-xs font-medium text-ink-900 truncate max-w-[90px]">{s.topic}</p>
                <p className="text-[11px] text-slate-400">{s.attempts} attempt{s.attempts !== 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {/* Weak Topics priority */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink-900 text-sm">Weak Topics</h2>
            <Link href="/weak-topics" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          {weakTopics.length === 0 ? (
            <p className="text-slate-400 text-sm">No weak topics yet — great job so far!</p>
          ) : (
            <div className="space-y-2">
              {weakTopics.map((w) => (
                <div key={w.topic} className="flex items-center justify-between p-2.5 rounded-control bg-slate-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${w.count >= 3 ? "bg-danger" : "bg-warning"}`} />
                    <span className="text-sm text-ink-900 truncate">{w.topic}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">{w.count} missed</span>
                    <Link href="/weak-topics" className="btn-secondary !min-h-0 !py-1 !px-2 text-xs">Practice</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="card">
          <h2 className="font-semibold text-ink-900 text-sm mb-4">Upcoming Exams</h2>
          {upcomingExams.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No exams tracked. Tag Planner tasks as "Exam Prep" with a due date to see countdowns here.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingExams.map((e) => (
                <div key={e.dueDate} className="flex items-center justify-between p-2.5 rounded-control bg-slate-50">
                  <div>
                    <p className="text-sm text-ink-900">{e.dueDate}</p>
                    <p className="text-xs text-slate-400">{e.prepPercent}% prep complete</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-brand-50 text-brand-600">{e.daysLeft}d left</span>
                    <Link href="/study-plan" className="btn-secondary !min-h-0 !py-1 !px-2 text-xs">Plan</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {/* Daily Challenge */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="text-warning" size={17} />
            <h2 className="font-semibold text-ink-900 text-sm">Daily Challenge</h2>
          </div>
          <p className="text-sm text-ink-600 mb-3">
            Take a quick quiz on {weakestSubject ? `"${weakestSubject.topic}"` : "a topic of your choice"} to keep your streak going.
          </p>
          <Link href="/quiz" className="btn-primary text-xs !py-1.5">
            Take Today's Challenge <ArrowRight size={13} />
          </Link>
        </div>

        {/* Achievements */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="text-brand-600" size={17} />
              <h2 className="font-semibold text-ink-900 text-sm">Achievements</h2>
            </div>
            {achievements && (
              <span className="text-xs text-ink-600">Level {achievements.level}</span>
            )}
          </div>
          {achievements && (
            <>
              <div className="h-1.5 bg-slate-100 rounded-pill mb-3 overflow-hidden">
                <motion.div
                  className="h-full bg-brand-500 rounded-pill"
                  initial={{ width: 0 }}
                  animate={{ width: `${achievements.xpIntoLevel}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {achievements.all.map((a) => (
                  <span
                    key={a.id}
                    className={`badge text-xs ${a.unlocked ? "bg-brand-50 text-brand-600" : "bg-slate-100 text-slate-400"}`}
                  >
                    {a.label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card mb-10">
        <h2 className="font-semibold text-ink-900 text-sm mb-4">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-slate-400 text-sm">Nothing yet — start using a tool above and it'll show up here.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((a, i) => {
              const Icon = ACTIVITY_ICONS[a.type] || Sparkles;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={13} className="text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-ink-900">{a.label}</p>
                    <p className="text-xs text-slate-400">{timeAgo(a.time)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <h2 className="section-title mb-4">Quick Actions</h2>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10">
        {[
          { href: "/notes", icon: NotebookText, label: "Notes" },
          { href: "/quiz", icon: Brain, label: "Quiz" },
          { href: "/flashcards", icon: LayersIcon, label: "Flashcards" },
          { href: "/math-tutor", icon: Calculator, label: "Math Tutor" },
          { href: "/roadmap", icon: Route, label: "Roadmap" },
          { href: "/chat", icon: MessageCircle, label: "Ask AI" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="card card-hover !p-3 flex flex-col items-center text-center gap-2">
            <div className="w-9 h-9 rounded-control bg-brand-50 flex items-center justify-center">
              <a.icon size={17} className="text-brand-600" />
            </div>
            <span className="text-xs font-medium text-ink-900">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Flagship features */}
      <h2 className="section-title mb-4">✨ Flagship AI Tools</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10">
        {starFeatures.map((f, i) => (
          <motion.div key={f.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.05 }}>
            <FeatureCard {...f} />
          </motion.div>
        ))}
      </div>

      {/* Full feature grid at the bottom */}
      <h2 className="section-title mb-4">All Study Tools</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {coreFeatures.map((f, i) => (
          <motion.div key={f.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }}>
            <FeatureCard {...f} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
