"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Sparkles, Trash2, RefreshCcw, Inbox } from "lucide-react";
import { useToast } from "../../components/ToastProvider";

const WEAK_TOPICS_KEY = "studyquiz_weak_topics";

export default function WeakTopicsPage() {
  const router = useRouter();
  const { toast } = useToast();
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
    toast("Weak topics cleared", "info");
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

  const topicCounts = entries.reduce((acc, e) => {
    acc[e.topic] = (acc[e.topic] || 0) + e.wrongCount;
    return acc;
  }, {});

  const topWeakness = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Target className="text-brand-600" size={22} />
          <h1 className="text-[26px] font-semibold text-ink-900">Weak Topics Tracker</h1>
        </div>
        {entries.length > 0 && (
          <button onClick={clearAll} className="btn-danger-ghost text-sm">
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {loaded && entries.length === 0 && (
        <div className="card flex flex-col items-center text-center py-14 text-slate-400">
          <Inbox size={32} className="mb-3" />
          <p className="text-sm max-w-xs">
            No weak topics yet — take a quiz and any missed questions will show up here automatically.
          </p>
        </div>
      )}

      {Object.keys(topicCounts).length > 0 && (
        <>
          <div className="card mb-4">
            <h2 className="font-semibold text-ink-900 mb-3 text-sm">Overview</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(topicCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([t, count]) => (
                  <span
                    key={t}
                    className={`badge ${
                      count >= 3 ? "bg-red-50 text-danger" : "bg-amber-50 text-warning"
                    }`}
                  >
                    {t} · {count} missed
                  </span>
                ))}
            </div>
          </div>

          {topWeakness && (
            <div className="rounded-card border border-brand-100 bg-brand-50 p-5 mb-6 flex items-start gap-3">
              <div className="w-9 h-9 rounded-control bg-white flex items-center justify-center shrink-0 shadow-soft">
                <Sparkles className="text-brand-600" size={17} />
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-600 tracking-wide mb-1">
                  AI RECOMMENDATION
                </p>
                <p className="text-sm text-ink-900">
                  <span className="font-medium">{topWeakness[0]}</span> looks like your biggest weak
                  spot right now with {topWeakness[1]} missed questions — worth a focused practice
                  round before anything else.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="card"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div>
                  <p className="font-semibold text-ink-900">{entry.topic}</p>
                  <p className="text-xs text-slate-400">
                    {entry.date} · missed {entry.wrongCount} / {entry.total}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => practiceAgain(entry)} className="btn-secondary text-sm">
                    <RefreshCcw size={14} /> Practice Again
                  </button>
                  <button onClick={() => removeEntry(entry.id)} className="btn-danger-ghost !min-h-0 !p-2">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <ul className="list-disc list-inside text-sm text-ink-600 space-y-1">
                {entry.wrongQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
