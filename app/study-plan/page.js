"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarRange, Sparkles, CheckCircle2 } from "lucide-react";
import { useToast } from "../../components/ToastProvider";

const TASKS_KEY = "studyquiz_tasks";
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const PRIORITY_STYLES = {
  Low: "bg-slate-100 text-ink-600",
  Medium: "bg-amber-50 text-warning",
  High: "bg-red-50 text-danger",
};

export default function StudyPlanPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState("");
  const [days, setDays] = useState(7);
  const [dailyHours, setDailyHours] = useState(3);
  const [difficulty, setDifficulty] = useState("Medium");
  const [details, setDetails] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addedToPlanner, setAddedToPlanner] = useState(false);
  const [checked, setChecked] = useState({});

  async function handleGenerate() {
    if (!subjects.trim()) return;
    setLoading(true);
    setError("");
    setPlan(null);
    setAddedToPlanner(false);
    setChecked({});
    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjects, days, dailyHours, difficulty, details }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate study plan");
      setPlan(data.plan || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleCheck(dayIdx, taskIdx) {
    const key = `${dayIdx}-${taskIdx}`;
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const totalTasks = plan ? plan.reduce((sum, d) => sum + (d.tasks?.length || 0), 0) : 0;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progressPct = totalTasks ? Math.round((checkedCount / totalTasks) * 100) : 0;

  function addAllToPlanner() {
    if (!plan) return;
    let existing = [];
    try {
      const saved = localStorage.getItem(TASKS_KEY);
      if (saved) existing = JSON.parse(saved);
    } catch (e) {
      existing = [];
    }

    const today = new Date();
    const newTasks = [];

    plan.forEach((day) => {
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + (day.day - 1));
      const dueDateStr = dueDate.toISOString().split("T")[0];

      (day.tasks || []).forEach((task) => {
        newTasks.push({
          id: Date.now() + Math.random(),
          title: `Day ${day.day}${day.focus ? " – " + day.focus : ""}: ${task}`,
          dueDate: dueDateStr,
          priority: day.priority || "Medium",
          category: "Exam Prep",
          done: false,
        });
      });
    });

    localStorage.setItem(TASKS_KEY, JSON.stringify([...newTasks, ...existing]));
    setAddedToPlanner(true);
    toast(`${newTasks.length} tasks added to your Planner`);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <CalendarRange className="text-brand-600" size={22} />
        <h1 className="text-[26px] font-semibold text-ink-900">Study Plan Generator</h1>
      </div>

      <div className="card mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-600 mb-1.5">
            Subjects / Topics (comma-separated)
          </label>
          <input
            type="text"
            placeholder="e.g. Data Structures, Operating Systems, DBMS"
            value={subjects}
            onChange={(e) => setSubjects(e.target.value)}
            className="input"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">Days until exam</label>
            <input
              type="number"
              min={1}
              max={60}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1.5">Hours/day</label>
            <input
              type="number"
              min={0.5}
              max={16}
              step={0.5}
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
              className="input"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-ink-600 mb-1.5">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input">
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-600 mb-1.5">Extra context (optional)</label>
          <input
            type="text"
            placeholder="e.g. Weak in DBMS joins, exam is mostly MCQs"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="input"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !subjects.trim()}
          className="btn-primary w-full sm:w-auto"
        >
          <Sparkles size={16} />
          {loading ? "Generating..." : "Generate Study Plan"}
        </button>
      </div>

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card space-y-2">
              <div className="skeleton h-5 w-40" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {plan && plan.length > 0 && (
        <div>
          <div className="card mb-5 !p-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <span className="text-sm font-medium text-ink-900">
                Progress: {checkedCount} / {totalTasks} tasks
              </span>
              {!addedToPlanner ? (
                <button onClick={addAllToPlanner} className="btn-secondary text-sm">
                  <CheckCircle2 size={15} /> Add All to Planner
                </button>
              ) : (
                <Link href="/planner" className="text-brand-600 text-sm font-medium hover:underline">
                  Added! View in Planner →
                </Link>
              )}
            </div>
            <div className="h-2 rounded-pill bg-slate-100 overflow-hidden">
              <motion.div
                className="h-full bg-brand-500 rounded-pill"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {plan.map((day, dayIdx) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: dayIdx * 0.02 }}
                  className="card"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <p className="font-semibold text-ink-900">
                      Day {day.day}
                      {day.focus && <span className="text-ink-600 font-normal"> — {day.focus}</span>}
                    </p>
                    <div className="flex items-center gap-2">
                      {day.estimatedHours && (
                        <span className="badge bg-slate-100 text-ink-600">{day.estimatedHours}h</span>
                      )}
                      {day.priority && (
                        <span className={`badge ${PRIORITY_STYLES[day.priority] || "bg-slate-100 text-ink-600"}`}>
                          {day.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {(day.tasks || []).map((t, i) => {
                      const key = `${dayIdx}-${i}`;
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!!checked[key]}
                            onChange={() => toggleCheck(dayIdx, i)}
                            className="w-4 h-4 mt-0.5 accent-brand-500 shrink-0"
                          />
                          <span className={checked[key] ? "line-through text-slate-400" : "text-ink-600"}>
                            {t}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
