"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Shuffle, ArrowRightCircle } from "lucide-react";
import { incrementFlashcardCount } from "../../lib/stats";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function FlashcardsPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(8);
  const [difficulty, setDifficulty] = useState("Medium");
  const [cards, setCards] = useState(null);
  const [flipped, setFlipped] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setCards(null);
    setFlipped({});
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate flashcards");
      setCards(data.cards || []);
      incrementFlashcardCount((data.cards || []).length);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleFlip(i) {
    setFlipped((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  function shuffleCards() {
    if (!cards) return;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped({});
  }

  function convertToQuiz() {
    if (!cards || cards.length === 0) return;
    const context = cards.map((c) => `Q: ${c.front}\nA: ${c.back}`).join("\n\n");
    localStorage.setItem(
      "studyquiz_flashcards_to_quiz",
      JSON.stringify({ topic, context })
    );
    router.push("/quiz?from=flashcards");
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Layers className="text-brand-600" size={22} />
        <h1 className="text-[26px] font-semibold text-ink-900">Flashcard Generator</h1>
      </div>

      <div className="card mb-8 space-y-3">
        <input
          type="text"
          placeholder="e.g. Newton's Laws of Motion, JavaScript Closures"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input"
        />
        <div className="grid grid-cols-3 gap-3">
          <input
            type="number"
            min={3}
            max={20}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="input"
          />
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input col-span-1">
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="btn-primary col-span-1 whitespace-nowrap"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      {loading && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card min-h-[140px] space-y-2">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {cards && cards.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-ink-600">{cards.length} cards · tap to flip</p>
            <button onClick={shuffleCards} className="btn-secondary text-sm">
              <Shuffle size={14} /> Shuffle
            </button>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6" style={{ perspective: 1000 }}>
            <AnimatePresence>
              {cards.map((card, i) => (
                <motion.button
                  key={`${card.front}-${i}`}
                  layout
                  onClick={() => toggleFlip(i)}
                  className="relative min-h-[150px] text-left"
                  style={{ transformStyle: "preserve-3d" }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1, rotateY: flipped[i] ? 180 : 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Front */}
                  <div
                    className="card absolute inset-0 flex items-center justify-center card-hover"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <p className="text-sm text-ink-900 text-center">
                      <span className="block text-xs font-semibold text-brand-600 mb-2">QUESTION</span>
                      {card.front}
                    </p>
                  </div>
                  {/* Back */}
                  <div
                    className="card absolute inset-0 flex items-center justify-center bg-brand-50"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <p className="text-sm text-ink-900 text-center">
                      <span className="block text-xs font-semibold text-brand-600 mb-2">ANSWER</span>
                      {card.back}
                    </p>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <button onClick={convertToQuiz} className="btn-secondary">
            <ArrowRightCircle size={16} /> Convert These to a Quiz
          </button>
        </>
      )}
    </div>
  );
}
