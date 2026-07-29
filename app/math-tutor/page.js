"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  Camera,
  Type,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  Upload,
} from "lucide-react";
import MathRender from "../../components/MathRender";
import MathToolbar from "../../components/MathToolbar";

const MODES = [
  { value: "eli10", label: "Explain Like I'm 10" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
];

const DIFFICULTY_STYLES = {
  Easy: "bg-green-50 text-success",
  Medium: "bg-amber-50 text-warning",
  Hard: "bg-red-50 text-danger",
};

export default function MathTutorPage() {
  const [tab, setTab] = useState("type");
  const [problem, setProblem] = useState("");
  const [mode, setMode] = useState("intermediate");
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openWhy, setOpenWhy] = useState({});
  const textareaRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setImagePreview(result);
      setImageBase64(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }

  async function handleSolve() {
    if (tab === "type" && !problem.trim()) return;
    if (tab === "photo" && !imageBase64) return;

    setLoading(true);
    setError("");
    setResult(null);
    setOpenWhy({});

    try {
      const res = await fetch("/api/math-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: tab === "type" ? problem : undefined,
          imageBase64: tab === "photo" ? imageBase64 : undefined,
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to solve");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleWhy(i) {
    setOpenWhy((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="text-brand-600" size={22} />
        <h1 className="text-[26px] font-semibold text-ink-900">AI Math Tutor</h1>
      </div>

      <div className="card mb-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-slate-100 rounded-control p-1 w-fit">
          <button
            onClick={() => setTab("type")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-sm font-medium transition-colors ${
              tab === "type" ? "bg-white shadow-soft text-brand-600" : "text-ink-600"
            }`}
          >
            <Type size={14} /> Type Equation
          </button>
          <button
            onClick={() => setTab("photo")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-sm font-medium transition-colors ${
              tab === "photo" ? "bg-white shadow-soft text-brand-600" : "text-ink-600"
            }`}
          >
            <Camera size={14} /> Upload Photo
          </button>
        </div>

        {tab === "type" ? (
          <div>
            <MathToolbar textareaRef={textareaRef} value={problem} onChange={setProblem} />
            <textarea
              ref={textareaRef}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={3}
              className="input font-mono resize-none"
              placeholder="e.g. \frac{d}{dx}(x^2 + 3x) or 2x^2 + 5x - 3 = 0"
            />
            {problem.trim() && (
              <div className="mt-3 p-3 rounded-control bg-slate-50 border border-line overflow-x-auto">
                <MathRender text={problem} displayMode />
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="flex flex-col items-center justify-center gap-2 rounded-control border-2 border-dashed border-line py-8 cursor-pointer hover:border-brand-500 transition-colors">
              <Upload className="text-slate-400" size={24} />
              <span className="text-sm text-ink-600">Click to upload a photo of the problem</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            {imagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Uploaded problem"
                className="mt-3 max-h-64 rounded-control border border-line mx-auto"
              />
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="input sm:w-56">
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button
            onClick={handleSolve}
            disabled={loading || (tab === "type" ? !problem.trim() : !imageBase64)}
            className="btn-primary flex-1"
          >
            {loading ? "Solving..." : "Solve Step by Step"}
          </button>
        </div>
        {error && <p className="text-danger text-sm mt-2">{error}</p>}
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-5/6" />
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="card">
              <p className="text-xs font-semibold text-brand-600 mb-1">PROBLEM</p>
              <MathRender text={result.problem} className="text-ink-900" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card">
                <p className="text-xs font-semibold text-brand-600 mb-1">WHAT'S BEING ASKED</p>
                <p className="text-sm text-ink-700">{result.whatIsAsked}</p>
                <p className="text-xs text-slate-400 mt-2">Chapter: {result.chapter}</p>
              </div>
              <div className="card">
                <p className="text-xs font-semibold text-brand-600 mb-1">FORMULA NEEDED</p>
                <MathRender text={result.formula} className="text-sm text-ink-900" />
                <p className="text-xs text-ink-600 mt-2">{result.whyFormula}</p>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-ink-900 mb-3">Step-by-Step Solution</h2>
              <div className="space-y-3">
                {(result.steps || []).map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card"
                  >
                    <p className="font-medium text-ink-900 mb-1.5">{step.title}</p>
                    <MathRender text={step.work} className="text-sm text-ink-700" />
                    <button
                      onClick={() => toggleWhy(i)}
                      className="flex items-center gap-1 text-xs font-medium text-brand-600 mt-2 hover:underline"
                    >
                      <Lightbulb size={12} />
                      Why?
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${openWhy[i] ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {openWhy[i] && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-ink-600 mt-2 bg-brand-50 rounded-control p-2.5 overflow-hidden"
                        >
                          {step.why}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>

            {result.commonMistakes?.length > 0 && (
              <div className="card border-amber-100 bg-amber-50/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="text-warning" size={16} />
                  <p className="font-semibold text-ink-900 text-sm">Common Mistakes</p>
                </div>
                <ul className="list-disc list-inside text-sm text-ink-600 space-y-1">
                  {result.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            )}

            <div className="card bg-brand-50 border-brand-100">
              <p className="text-xs font-semibold text-brand-600 mb-1">FINAL ANSWER</p>
              <MathRender text={result.finalAnswer} className="text-lg font-semibold text-ink-900" />
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-ink-900 text-sm">Practice Question</p>
                {result.difficulty && (
                  <span className={`badge ${DIFFICULTY_STYLES[result.difficulty] || "bg-slate-100"}`}>
                    {result.difficulty}
                  </span>
                )}
              </div>
              <MathRender text={result.practiceQuestion} className="text-sm text-ink-700" />
            </div>

            {result.realLifeExample && (
              <div className="card">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="text-brand-600" size={15} />
                  <p className="font-semibold text-ink-900 text-sm">Real-Life Example</p>
                </div>
                <p className="text-sm text-ink-600">{result.realLifeExample}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
