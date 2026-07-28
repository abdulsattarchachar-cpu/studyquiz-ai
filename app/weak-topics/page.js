"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const WEAK_TOPICS_KEY = "studyquiz_weak_topics";

export default function WeakTopicsPage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WEAK_TOPICS_KEY);
      if (saved) setEntries(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
    setLoaded(true);
  }, []);

  function clearAll() {
    localStorage.removeItem(WEAK_TOPICS_KEY);
    setEntries([]);
  }

  function removeEntry(id) {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem(WEAK_TOPICS_KEY, JSON.stringify(updated));
  }

  function practiceAgain(entry) {
    const context = entry.wrongQuestions
      .map((q, i) => `Missed question ${i + 1}: ${q}`)
      .join("\n");
    localStorage.setItem(
      "studyquiz_flashcards_to_quiz",
      JSON.stringify({
        topic: entry.topic,
        context: `The student previously got these questions wrong on "${entry.topic}":\n${context}\n\nGenerate new practice questions covering the same underlying concepts, phrased differently.`,
      })
    );
    router.push("/quiz?from=weak-topics");
  }

  // Aggregate by topic for a quick overview
  const topicCounts = entries.reduce((acc, e) => {
    acc[e.topic] = (acc[e.topic] || 0) + e.wrongCount;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-slate-900">Weak Topics Tracker</h1>
        {entries.length > 0 && (
          <button onClick={clearAll} className="text-sm text-slate-400 hover:text-red-500">
            Clear All
          </button>
        )}
      </div>

      {loaded && entries.length === 0 && (
        <p className="text-slate-400 text-sm">
          No weak topics yet — take a quiz and any missed questions will show up here automatically.
        </p>
      )}

      {Object.keys(topicCounts).length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-slate-700 mb-3">Overview</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(topicCounts).map(([t, count]) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium"
              >
                {t} · {count} missed
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="card">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div>
                <p className="font-semibold text-slate-800">{entry.topic}</p>
                <p className="text-xs text-slate-400">
                  {entry.date} · missed {entry.wrongCount} / {entry.total}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => practiceAgain(entry)} className="btn-secondary text-sm">
                  Generate Practice Questions
                </button>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-slate-400 hover:text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              {entry.wrongQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
