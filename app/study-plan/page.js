"use client";

import { useState } from "react";
import Link from "next/link";

const TASKS_KEY = "studyquiz_tasks";

export default function StudyPlanPage() {
  const [subjects, setSubjects] = useState("");
  const [days, setDays] = useState(7);
  const [details, setDetails] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addedToPlanner, setAddedToPlanner] = useState(false);

  async function handleGenerate() {
    if (!subjects.trim()) return;
    setLoading(true);
    setError("");
    setPlan(null);
    setAddedToPlanner(false);
    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjects, days, details }),
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
          done: false,
        });
      });
    });

    localStorage.setItem(TASKS_KEY, JSON.stringify([...newTasks, ...existing]));
    setAddedToPlanner(true);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Study Plan Generator</h1>

      <div className="card mb-8 space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
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

        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Days until exam / deadline
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex-[2]">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Extra context (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Weak in DBMS joins, exam is mostly MCQs"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !subjects.trim()}
          className="btn-primary w-full sm:w-auto"
        >
          {loading ? "Generating..." : "Generate Study Plan"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {plan && plan.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-slate-700">Your {plan.length}-Day Plan</h2>
            {!addedToPlanner ? (
              <button onClick={addAllToPlanner} className="btn-secondary text-sm">
                + Add All to Planner
              </button>
            ) : (
              <Link href="/planner" className="text-brand-600 text-sm font-medium hover:underline">
                Added! View in Planner →
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {plan.map((day) => (
              <div key={day.day} className="card">
                <p className="font-semibold text-slate-800 mb-2">
                  Day {day.day}
                  {day.focus && <span className="text-slate-500 font-normal"> — {day.focus}</span>}
                </p>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {(day.tasks || []).map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
