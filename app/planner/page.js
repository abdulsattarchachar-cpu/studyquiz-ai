"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListChecks, Plus, Trash2, Inbox } from "lucide-react";
import { useToast } from "../../components/ToastProvider";

const STORAGE_KEY = "studyquiz_tasks";
const PRIORITIES = ["Low", "Medium", "High"];
const CATEGORIES = ["General", "Assignment", "Exam Prep", "Reading", "Project"];

const PRIORITY_STYLES = {
  Low: "bg-slate-100 text-ink-600",
  Medium: "bg-amber-50 text-warning",
  High: "bg-red-50 text-danger",
};

export default function PlannerPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("General");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTasks(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load tasks", e);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, loaded]);

  function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setTasks((prev) => [
      { id: Date.now(), title: title.trim(), dueDate, priority, category, done: false },
      ...prev,
    ]);
    setTitle("");
    setDueDate("");
    toast("Task added to your planner");
  }

  function toggleTask(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast("Task removed", "info");
  }

  const pending = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ListChecks className="text-brand-600" size={22} />
        <h1 className="text-[26px] font-semibold text-ink-900">Study Planner</h1>
      </div>

      <form onSubmit={addTask} className="card mb-8 space-y-3">
        <input
          type="text"
          placeholder="e.g. Revise Data Structures Ch. 4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input col-span-2 sm:col-span-1"
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input">
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p} Priority</option>
            ))}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary sm:col-span-1">
            <Plus size={16} /> Add Task
          </button>
        </div>
      </form>

      <div className="grid md:grid-cols-2 gap-6">
        <TaskColumn
          title="Pending"
          tasks={pending}
          onToggle={toggleTask}
          onDelete={deleteTask}
          emptyText="No pending tasks. Nice work!"
        />
        <TaskColumn
          title="Completed"
          tasks={completed}
          onToggle={toggleTask}
          onDelete={deleteTask}
          emptyText="Nothing completed yet."
        />
      </div>
    </div>
  );
}

function TaskColumn({ title, tasks, onToggle, onDelete, emptyText }) {
  return (
    <div>
      <h2 className="font-semibold text-ink-900 mb-3">
        {title} <span className="text-ink-600 font-normal">({tasks.length})</span>
      </h2>
      <div className="space-y-2">
        {tasks.length === 0 && (
          <div className="card flex flex-col items-center text-center py-8 text-slate-400">
            <Inbox size={28} className="mb-2" />
            <p className="text-sm">{emptyText}</p>
          </div>
        )}
        <AnimatePresence>
          {tasks.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="card !p-4 flex items-center justify-between"
            >
              <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => onToggle(t.id)}
                  className="w-4 h-4 accent-brand-500 shrink-0"
                />
                <div className="min-w-0">
                  <p className={`font-medium truncate ${t.done ? "line-through text-slate-400" : "text-ink-900"}`}>
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {t.dueDate && <span className="text-xs text-slate-400">Due: {t.dueDate}</span>}
                    {t.priority && (
                      <span className={`badge ${PRIORITY_STYLES[t.priority] || "bg-slate-100 text-ink-600"}`}>
                        {t.priority}
                      </span>
                    )}
                    {t.category && (
                      <span className="badge bg-brand-50 text-brand-600">{t.category}</span>
                    )}
                  </div>
                </div>
              </label>
              <button onClick={() => onDelete(t.id)} className="btn-danger-ghost !min-h-0 !p-2 ml-2 shrink-0">
                <Trash2 size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
