"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FlashcardsPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(8);
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
        body: JSON.stringify({ topic, count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate flashcards");
      setCards(data.cards || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleFlip(i) {
    setFlipped((prev) => ({ ...prev, [i]: !prev[i] }));
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
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Flashcard Generator</h1>

      <div className="card mb-8 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="e.g. Newton's Laws of Motion, JavaScript Closures"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input flex-1"
        />
        <input
          type="number"
          min={3}
          max={20}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="input sm:w-24"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="btn-primary whitespace-nowrap"
        >
          {loading ? "Generating..." : "Generate Flashcards"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {cards && cards.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {cards.map((card, i) => (
              <button
                key={i}
                onClick={() => toggleFlip(i)}
                className="card text-left min-h-[140px] flex items-center justify-center hover:shadow-md transition"
              >
                <p className="text-sm text-slate-700">
                  <span className="block text-xs font-semibold text-brand-600 mb-2">
                    {flipped[i] ? "ANSWER (tap to flip back)" : "QUESTION (tap to reveal)"}
                  </span>
                  {flipped[i] ? card.back : card.front}
                </p>
              </button>
            ))}
          </div>

          <button onClick={convertToQuiz} className="btn-secondary">
            Convert These to a Quiz →
          </button>
        </>
      )}
    </div>
  );
}
