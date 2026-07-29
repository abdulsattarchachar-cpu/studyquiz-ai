"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Route, ChevronDown, Plus, Brain, Sparkles } from "lucide-react";
import { useToast } from "../../components/ToastProvider";
import { logActivity, recordActivity } from "../../lib/stats";

const TASKS_KEY = "studyquiz_tasks";

export default function RoadmapPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [goal, setGoal] = useState("");
  const [totalDays, setTotalDays] = useState(90);
  const [hoursPerDay, setHoursPerDay] = useState(1);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openWeek, setOpenWeek] = useState(0);
  const [added, setAdded] = useState(false);

  async function handleGenerate() {
    if (!goal.trim()) return;
    setLoading(true);
    setError("");
    setRoadmap(null);
    setAdded(false);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, totalDays, hoursPerDay }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate roadmap");
      setRoadmap(data);
      setOpenWeek(0);
      recordActivity();
      logActivity("roadmap", `Generated a ${totalDays}-day roadmap for "${goal}"`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function addWeekToPlanner(week) {
    let existing = [];
    try {
      const saved = localStorage.getItem(TASKS_KEY);
      if (saved) existing = JSON.parse(saved);
    } catch (e) {
      existing = [];
    }
    const today = new Date();
    const newTasks = [];
    week.days.forEach((d) => {
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + (week.week - 1) * 7 + (d.day - 1));
      const dueDateStr = dueDate.toISOString().split("T")[0];
      (d.tasks || []).forEach((task) => {
        newTasks.push({
          id: Date.now() + Math.random(),
          title: `[${goal}] Week ${week.week} Day ${d.day}: ${task}`,
          dueDate: dueDateStr,
          priority: "Medium",
          category: "Exam Prep",
          done: false,
        });
      });
    });
    localStorage.setItem(TASKS_KEY, JSON.stringify([...newTasks, ...existing]));
    setAdded(true);
    toast(`Week ${week.week} added to your Planner`);
  }

  function testYourself(topic) {
    localStorage.setItem(
      "studyquiz_flashcards_to_quiz",
      JSON.stringify({ topic, context: null })
    );
    router.push("/quiz?from=roadmap");
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Route className="text-brand-600" size={22} />
        <h1 className="text-[26px] font-semibold text-ink-900">AI Roadmap Generator</h1>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Resource links open a live YouTube/Google search for that topic — not a single hardcoded video,
        so you always get current, working results.
      </p>

      <div className="card mb-6 space-y-3">
        <div>
          <label className="block text-sm font-medium text-ink-600 mb-1">
            What do you want to learn?
          </label>
          <input
            type="text"
            placeholder="e.g. I want to learn Java"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="input"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1">Total days</label>
            <input
              type="number"
              min={7}
              max={365}
              value={totalDays}
              onChange={(e) => setTotalDays(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-1">Hours/day</label>
            <input
              type="number"
              min={0.5}
              max={8}
              step={0.5}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              className="input"
            />
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading || !goal.trim()} className="btn-primary w-full">
          {loading ? "Building your roadmap..." : "Generate Roadmap"}
        </button>
        {error && <p className="text-danger text-sm">{error}</p>}
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
        </div>
      )}

      <AnimatePresence>
        {roadmap && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-card border border-brand-100 bg-brand-50 p-5 mb-6 flex items-start gap-3">
              <div className="w-9 h-9 rounded-control bg-white flex items-center justify-center shrink-0 shadow-soft">
                <Sparkles className="text-brand-600" size={17} />
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-600 tracking-wide mb-1">
                  {roadmap.totalDays}-DAY ROADMAP OVERVIEW
                </p>
                <p className="text-sm text-ink-900">{roadmap.overview}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {(roadmap.weeks || []).map((week, i) => (
                <div key={week.week} className="card !p-0 overflow-hidden">
                  <button
                    onClick={() => setOpenWeek(openWeek === i ? -1 : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-ink-900 text-sm">Week {week.week}</p>
                      <p className="text-xs text-ink-600">{week.goal}</p>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform shrink-0 ${openWeek === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openWeek === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-line"
                      >
                        <div className="p-4 space-y-3">
                          {week.days.map((d) => (
                            <div key={d.day} className="text-sm">
                              <p className="font-medium text-ink-900 mb-1">Day {d.day}</p>
                              <ul className="list-disc list-inside text-ink-600 space-y-0.5">
                                {d.tasks.map((t, ti) => <li key={ti}>{t}</li>)}
                              </ul>
                              {d.resources?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {d.resources.map((r, ri) => (
                                    <div key={ri} className="flex items-center gap-1">
                                      <span className="text-xs text-slate-400">{r}:</span>
                                      <a
                                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(r + " " + goal)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="badge bg-red-50 text-danger hover:bg-red-100 transition-colors text-xs"
                                      >
                                        YouTube
                                      </a>
                                      <a
                                        href={`https://www.google.com/search?q=${encodeURIComponent(r + " " + goal)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="badge bg-slate-100 text-ink-600 hover:bg-slate-200 transition-colors text-xs"
                                      >
                                        Google
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addWeekToPlanner(week)}
                            className="btn-secondary text-xs mt-2"
                          >
                            <Plus size={13} /> Add Week {week.week} to Planner
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {roadmap.finalQuizTopics?.length > 0 && (
              <div className="card mb-4">
                <p className="font-semibold text-ink-900 text-sm mb-2">Test Yourself</p>
                <div className="flex flex-wrap gap-2">
                  {roadmap.finalQuizTopics.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => testYourself(t)}
                      className="badge bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                    >
                      <Brain size={11} className="inline mr-1" />
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {roadmap.revisionTips?.length > 0 && (
              <div className="card">
                <p className="font-semibold text-ink-900 text-sm mb-2">Revision Tips</p>
                <ul className="list-disc list-inside text-sm text-ink-600 space-y-1">
                  {roadmap.revisionTips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
