"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  ListChecks,
  Lightbulb,
  Sparkles,
  PenLine,
  Brain,
  Target,
  NotebookText,
  Home,
  Award,
} from "lucide-react";
import Confetti from "../../components/Confetti";
import { setContinueLearning, clearContinueLearning, logActivity, recordActivity } from "../../lib/stats";

const STAGES = [
  { id: "introduction", label: "Introduction", icon: BookOpen, type: "content" },
  { id: "prerequisites", label: "Prerequisites", icon: ListChecks, type: "content" },
  { id: "concept", label: "Concept", icon: Lightbulb, type: "content" },
  { id: "example", label: "Example", icon: Sparkles, type: "content" },
  { id: "practice1", label: "Practice 1", icon: PenLine, type: "practice" },
  { id: "practice2", label: "Practice 2", icon: PenLine, type: "practice" },
  { id: "quiz", label: "Quiz", icon: Brain, type: "quiz" },
  { id: "weakPoints", label: "Weak Points", icon: Target, type: "content" },
  { id: "revisionNotes", label: "Revision Notes", icon: NotebookText, type: "content" },
  { id: "homework", label: "Homework", icon: Home, type: "content" },
  { id: "finalAssessment", label: "Final Assessment", icon: Award, type: "content" },
];

function LearnPageInner() {
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const resumeTopic = searchParams.get("topic");
    if (resumeTopic) setTopic(resumeTopic);
  }, [searchParams]);

  const [stageIndex, setStageIndex] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [stageContent, setStageContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // practice state
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState(null);
  const [practiceSubmitting, setPracticeSubmitting] = useState(false);

  // quiz state
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentStage = STAGES[stageIndex];

  async function fetchStage(idx, extra = {}) {
    const stage = STAGES[idx];
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/learn-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, stage: stage.id, transcript, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load this stage");

      if (stage.type === "quiz") {
        setQuizQuestions(data.questions || []);
      } else {
        setStageContent((prev) => ({ ...prev, [stage.id]: data.content }));
      }
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    if (!topic.trim()) return;
    setStarted(true);
    setStageIndex(0);
    setTranscript([]);
    setStageContent({});
    recordActivity();
    logActivity("learn", `Started an AI Teacher lesson on "${topic}"`);
    setContinueLearning({ topic, stageIndex: 0, stageLabel: STAGES[0].label, totalStages: STAGES.length });
    await fetchStage(0);
  }

  async function goToNextStage() {
    const stage = currentStage;
    if (stage.type === "content" && stageContent[stage.id]) {
      setTranscript((prev) => [...prev, `${stage.label}: ${stageContent[stage.id]}`]);
    }

    const nextIndex = stageIndex + 1;
    if (nextIndex >= STAGES.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
      clearContinueLearning();
      return;
    }

    setStageIndex(nextIndex);
    setPracticeAnswer("");
    setPracticeFeedback(null);
    setQuizSubmitted(false);
    setQuizAnswers({});
    setContinueLearning({
      topic,
      stageIndex: nextIndex,
      stageLabel: STAGES[nextIndex].label,
      totalStages: STAGES.length,
    });

    const nextStage = STAGES[nextIndex];
    if (nextStage.type === "content" && !stageContent[nextStage.id]) {
      await fetchStage(nextIndex);
    } else if (nextStage.type === "practice" && !stageContent[nextStage.id]) {
      await fetchStage(nextIndex);
    } else if (nextStage.type === "quiz" && !quizQuestions) {
      await fetchStage(nextIndex);
    }
  }

  async function submitPractice() {
    if (!practiceAnswer.trim()) return;
    setPracticeSubmitting(true);
    const data = await fetchStage(stageIndex, {
      action: "evaluate_practice",
      practiceQuestion: stageContent[currentStage.id],
      studentAnswer: practiceAnswer,
    });
    setPracticeSubmitting(false);
    if (data) setPracticeFeedback(data.content);
  }

  function selectQuizAnswer(qIndex, optIndex) {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  }

  async function submitQuiz() {
    setQuizSubmitted(true);
    const wrong = quizQuestions
      .filter((q, i) => quizAnswers[i] !== q.correctIndex)
      .map((q) => q.question);
    setWrongQuestions(wrong);
  }

  async function proceedAfterQuiz() {
    setTranscript((prev) => [
      ...prev,
      `Quiz: student scored ${quizQuestions.length - wrongQuestions.length}/${quizQuestions.length}`,
    ]);
    const nextIndex = stageIndex + 1;
    setStageIndex(nextIndex);
    setContinueLearning({
      topic,
      stageIndex: nextIndex,
      stageLabel: STAGES[nextIndex]?.label || "Complete",
      totalStages: STAGES.length,
    });
    await fetchStage(nextIndex, { wrongQuestions });
  }

  if (!started) {
    return (
      <div className="max-w-xl mx-auto text-center pt-12">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="text-brand-600" size={26} />
        </div>
        <h1 className="text-[26px] font-semibold text-ink-900 mb-2">AI Learning Mode</h1>
        <p className="text-ink-600 mb-6">
          Not just a chatbot — a full AI teacher. Tell it what you want to learn, and it walks you
          through a real lesson: introduction, concept, examples, practice with feedback, a quiz,
          revision notes, and homework.
        </p>
        <div className="card text-left">
          <label className="block text-sm font-medium text-ink-600 mb-2">What do you want to learn?</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Teach me Integration"
            className="input mb-3"
          />
          <button onClick={handleStart} disabled={!topic.trim()} className="btn-primary w-full">
            Start Lesson <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showConfetti && <Confetti count={40} />}

      <div className="flex items-center gap-2 mb-2">
        <GraduationCap className="text-brand-600" size={22} />
        <h1 className="text-[22px] font-semibold text-ink-900">Learning: {topic}</h1>
      </div>

      {/* Progress timeline */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const done = i < stageIndex;
          const active = i === stageIndex;
          return (
            <div key={s.id} className="flex items-center shrink-0">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-control text-xs font-medium ${
                  active
                    ? "bg-brand-500 text-white"
                    : done
                    ? "bg-brand-50 text-brand-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <CheckCircle2 size={13} /> : <Icon size={13} />}
                <span className="whitespace-nowrap hidden sm:inline">{s.label}</span>
              </div>
              {i < STAGES.length - 1 && <div className="w-3 h-px bg-line shrink-0" />}
            </div>
          );
        })}
      </div>

      {error && <p className="text-danger text-sm mb-3">{error}</p>}

      <AnimatePresence mode="wait">
        <motion.div
          key={stageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {loading && (
            <div className="card space-y-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          )}

          {!loading && currentStage.type === "content" && stageContent[currentStage.id] && (
            <div className="card">
              <p className="text-xs font-semibold text-brand-600 mb-2">{currentStage.label.toUpperCase()}</p>
              <p className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">
                {stageContent[currentStage.id]}
              </p>
              <button onClick={goToNextStage} className="btn-primary mt-4">
                {stageIndex === STAGES.length - 1 ? "Finish Lesson" : "Continue"} <ArrowRight size={15} />
              </button>
            </div>
          )}

          {!loading && currentStage.type === "practice" && stageContent[currentStage.id] && (
            <div className="card">
              <p className="text-xs font-semibold text-brand-600 mb-2">{currentStage.label.toUpperCase()}</p>
              <p className="text-sm text-ink-900 mb-3">{stageContent[currentStage.id]}</p>
              <textarea
                value={practiceAnswer}
                onChange={(e) => setPracticeAnswer(e.target.value)}
                rows={3}
                className="input resize-none mb-2"
                placeholder="Type your answer..."
                disabled={!!practiceFeedback}
              />
              {!practiceFeedback ? (
                <button
                  onClick={submitPractice}
                  disabled={!practiceAnswer.trim() || practiceSubmitting}
                  className="btn-primary"
                >
                  {practiceSubmitting ? "Checking..." : "Submit Answer"}
                </button>
              ) : (
                <>
                  <div className="bg-brand-50 rounded-control p-3 text-sm text-ink-700 mb-3">
                    {practiceFeedback}
                  </div>
                  <button onClick={goToNextStage} className="btn-primary">
                    Continue <ArrowRight size={15} />
                  </button>
                </>
              )}
            </div>
          )}

          {!loading && currentStage.type === "quiz" && quizQuestions && (
            <div className="space-y-3">
              {quizQuestions.map((q, qi) => (
                <div key={qi} className="card">
                  <p className="font-medium text-ink-900 mb-3 text-sm">{qi + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = quizAnswers[qi] === oi;
                      const isCorrect = quizSubmitted && oi === q.correctIndex;
                      const isWrongSelected = quizSubmitted && isSelected && oi !== q.correctIndex;
                      return (
                        <button
                          key={oi}
                          onClick={() => selectQuizAnswer(qi, oi)}
                          className={`w-full text-left px-3 py-2 rounded-control border text-sm transition
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
                </div>
              ))}
              {!quizSubmitted ? (
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  className="btn-primary w-full"
                >
                  Submit Quiz
                </button>
              ) : (
                <div className="card text-center">
                  <p className="font-semibold text-ink-900">
                    Score: {quizQuestions.length - wrongQuestions.length}/{quizQuestions.length}
                  </p>
                  <button onClick={proceedAfterQuiz} className="btn-primary mt-3">
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 text-sm">Loading...</div>}>
      <LearnPageInner />
    </Suspense>
  );
}
