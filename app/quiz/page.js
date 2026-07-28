"use client";

import { useState, useEffect, useRef } from "react";

const WEAK_TOPICS_KEY = "studyquiz_weak_topics";

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const contextRef = useRef(null);
  const [fromFlashcards, setFromFlashcards] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("studyquiz_flashcards_to_quiz");
      if (stored) {
        const parsed = JSON.parse(stored);
        contextRef.current = parsed.context;
        setTopic(parsed.topic);
        setFromFlashcards(true);
        localStorage.removeItem("studyquiz_flashcards_to_quiz");
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setQuestions(null);
    setAnswers({});
    setSubmitted(false);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          numQuestions,
          context: contextRef.current || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate quiz");
      setQuestions(data.questions || []);
      contextRef.current = null;
      setFromFlashcards(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function recordWeakTopics() {
    if (!questions) return;
    const wrong = questions.filter((q, i) => answers[i] !== q.correctIndex);
    if (wrong.length === 0) return;

    let existing = [];
    try {
      const saved = localStorage.getItem(WEAK_TOPICS_KEY);
      if (saved) existing = JSON.parse(saved);
    } catch (e) {
      existing = [];
    }

    const entry = {
      id: Date.now(),
      topic,
      date: new Date().toISOString().split("T")[0],
      wrongQuestions: wrong.map((q) => q.question),
      total: questions.length,
      wrongCount: wrong.length,
    };

    localStorage.setItem(WEAK_TOPICS_KEY, JSON.stringify([entry, ...existing]));
  }

  function handleSubmit() {
    setSubmitted(true);
    recordWeakTopics();
  }

  function selectAnswer(qIndex, optIndex) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  }

  const score = questions
    ? questions.reduce(
        (acc, q, i) => (answers[i] === q.correctIndex ? acc + 1 : acc),
        0
      )
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Quiz Generator</h1>
      {fromFlashcards && (
        <p className="text-sm text-brand-600 mb-4">
          ✓ Loaded from your flashcards — click Generate to build a quiz from them.
        </p>
      )}

      <div className="card mb-8 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="e.g. Operating Systems, Photosynthesis, World War 2"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input flex-1"
        />
        <input
          type="number"
          min={1}
          max={15}
          value={numQuestions}
          onChange={(e) => setNumQuestions(e.target.value)}
          className="input sm:w-24"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="btn-primary whitespace-nowrap"
        >
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {questions && questions.length > 0 && (
        <div className="space-y-5">
          {questions.map((q, qi) => (
            <div key={qi} className="card">
              <p className="font-medium text-slate-800 mb-3">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[qi] === oi;
                  const isCorrect = submitted && oi === q.correctIndex;
                  const isWrongSelected =
                    submitted && isSelected && oi !== q.correctIndex;

                  return (
                    <button
                      key={oi}
                      onClick={() => selectAnswer(qi, oi)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition
                        ${isSelected ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}
                        ${isCorrect ? "border-green-500 bg-green-50" : ""}
                        ${isWrongSelected ? "border-red-400 bg-red-50" : ""}
                      `}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="btn-primary w-full"
              disabled={Object.keys(answers).length < questions.length}
            >
              Submit Answers
            </button>
          ) : (
            <div className="card text-center">
              <p className="text-lg font-semibold text-slate-800">
                You scored {score} / {questions.length}
              </p>
              {score < questions.length && (
                <p className="text-sm text-slate-500 mt-1">
                  Missed questions saved to your{" "}
                  <a href="/weak-topics" className="text-brand-600 hover:underline">
                    Weak Topics tracker
                  </a>
                  .
                </p>
              )}
              <button
                onClick={handleGenerate}
                className="btn-secondary mt-3"
              >
                Try Another Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
