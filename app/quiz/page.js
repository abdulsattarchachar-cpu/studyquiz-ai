"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, RotateCcw } from "lucide-react";
import Confetti from "../../components/Confetti";
import { recordQuizAttempt } from "../../lib/stats";

const WEAK_TOPICS_KEY = "studyquiz_weak_topics";
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("Medium");
  const [questions, setQuestions] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
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
  }, []);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setQuestions(null);
    setAnswers({});
    setSubmitted(false);
    setCurrent(0);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          numQuestions,
          difficulty,
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

  function selectAnswer(qIndex, optIndex) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  }

  function recordWeakTopics(wrong) {
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
    const wrong = questions.filter((q, i) => answers[i] !== q.correctIndex);
    recordWeakTopics(wrong);
    recordQuizAttempt({ topic, score: questions.length - wrong.length, total: questions.length });
    if (wrong.length === 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }

  const score = questions
    ? questions.reduce((acc, q, i) => (answers[i] === q.correctIndex ? acc + 1 : acc), 0)
    : 0;
  const answeredCount = Object.keys(answers).length;
  const progressPct = questions ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div>
      {showConfetti && <Confetti />}

      <div className="flex items-center gap-2 mb-1">
        <Brain className="text-brand-600" size={22} />
        <h1 className="text-[26px] font-semibold text-ink-900">Quiz Generator</h1>
      </div>
      {fromFlashcards && (
        <p className="text-sm text-brand-600 mb-4">
          ✓ Loaded from your flashcards — click Generate to build a quiz from them.
        </p>
      )}
      {!fromFlashcards && <div className="mb-5" />}

      <div className="card mb-8 space-y-3">
        <input
          type="text"
          placeholder="e.g. Operating Systems, Photosynthesis, World War 2"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input"
        />
        <div className="grid grid-cols-3 gap-3">
          <input
            type="number"
            min={1}
            max={15}
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="input"
          />
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input">
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="btn-primary whitespace-nowrap"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card space-y-3">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-9 w-full" />
              <div className="skeleton h-9 w-full" />
            </div>
          ))}
        </div>
      )}

      {questions && questions.length > 0 && (
        <div className="space-y-5">
          {!submitted && (
            <div>
              <div className="flex justify-between text-xs text-ink-600 mb-1.5">
                <span>{answeredCount} / {questions.length} answered</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 rounded-pill bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full bg-brand-500 rounded-pill"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
            </div>
          )}

          {questions.map((q, qi) => (
            <motion.div
              key={qi}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: qi * 0.03 }}
              className="card"
            >
              <p className="font-medium text-ink-900 mb-3">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[qi] === oi;
                  const isCorrect = submitted && oi === q.correctIndex;
                  const isWrongSelected = submitted && isSelected && oi !== q.correctIndex;

                  return (
                    <button
                      key={oi}
                      onClick={() => selectAnswer(qi, oi)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-control border text-sm transition min-h-[44px]
                        ${isSelected ? "border-brand-500 bg-brand-50" : "border-line hover:bg-slate-50"}
                        ${isCorrect ? "border-success bg-green-50" : ""}
                        ${isWrongSelected ? "border-danger bg-red-50" : ""}
                      `}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="btn-primary w-full"
              disabled={answeredCount < questions.length}
            >
              Submit Answers
            </button>
          ) : (
            <div className="card text-center">
              <p className="text-2xl font-semibold text-ink-900">
                {score} / {questions.length}
              </p>
              <p className="text-sm text-ink-600 mt-1">
                {Math.round((score / questions.length) * 100)}% accuracy
              </p>
              {score < questions.length && (
                <p className="text-sm text-ink-600 mt-2">
                  Missed questions saved to your{" "}
                  <a href="/weak-topics" className="text-brand-600 hover:underline">
                    Weak Topics tracker
                  </a>
                  .
                </p>
              )}
              <button onClick={handleGenerate} className="btn-secondary mt-4">
                <RotateCcw size={15} /> Try Another Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
