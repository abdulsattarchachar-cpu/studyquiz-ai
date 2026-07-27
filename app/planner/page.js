"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "studyquiz_tasks";

export default function PlannerPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
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
      { id: Date.now(), title: title.trim(), dueDate, done: false },
      ...prev,
    ]);
    setTitle("");
    setDueDate("");
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const pending = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Study Planner</h1>

      <form onSubmit={addTask} className="card mb-8 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="e.g. Revise Data Structures Ch. 4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input flex-1"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input sm:w-44"
        />
        <button type="submit" className="btn-primary whitespace-nowrap">
          Add Task
        </button>
      </form>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold text-slate-700 mb-3">Pending ({pending.length})</h2>
          <div className="space-y-2">
            {pending.length === 0 && (
              <p className="text-slate-400 text-sm">No pending tasks. Nice work!</p>
            )}
            {pending.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-slate-700 mb-3">Completed ({completed.length})</h2>
          <div className="space-y-2">
            {completed.length === 0 && (
              <p className="text-slate-400 text-sm">Nothing completed yet.</p>
            )}
            {completed.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  return (
    <div className="card flex items-center justify-between py-3">
      <label className="flex items-center gap-3 cursor-pointer flex-1">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
          className="w-4 h-4 accent-brand-500"
        />
        <div>
          <p className={`font-medium ${task.done ? "line-through text-slate-400" : "text-slate-800"}`}>
            {task.title}
          </p>
          {task.dueDate && (
            <p className="text-xs text-slate-400">Due: {task.dueDate}</p>
          )}
        </div>
      </label>
      <button
        onClick={() => onDelete(task.id)}
        className="text-slate-400 hover:text-red-500 text-sm ml-3"
      >
        Delete
      </button>
    </div>
  );
}
