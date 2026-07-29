"use client";

import { useState } from "react";
import { PenSquare, Copy, Download, Check } from "lucide-react";
import { useToast } from "../../components/ToastProvider";

export default function EssayGraderPage() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [assignmentType, setAssignmentType] = useState("Essay");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGrade() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, assignmentType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grade");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function feedbackAsText() {
    if (!result) return "";
    return [
      `Overall Score: ${result.overallScore}/100`,
      "",
      result.summary,
      "",
      "Strengths:",
      ...(result.strengths || []).map((s) => `- ${s}`),
      "",
      "Areas to Improve:",
      ...(result.improvements || []).map((s) => `- ${s}`),
      "",
      "Grammar & Style Notes:",
      ...(result.grammarNotes || []).map((s) => `- ${s}`),
    ].join("\n");
  }

  function copyFeedback() {
    navigator.clipboard.writeText(feedbackAsText());
    setCopied(true);
    toast("Feedback copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadFeedback() {
    const blob = new Blob([feedbackAsText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "essay-feedback.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast("Feedback report downloaded");
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <PenSquare className="text-brand-600" size={22} />
        <h1 className="text-[26px] font-semibold text-ink-900">Essay / Assignment Grader</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <label className="block text-sm font-medium text-ink-600 mb-2">Assignment type</label>
          <select
            value={assignmentType}
            onChange={(e) => setAssignmentType(e.target.value)}
            className="input mb-4"
          >
            <option>Essay</option>
            <option>Report</option>
            <option>Research Paper Excerpt</option>
            <option>Short Answer</option>
            <option>Cover Letter</option>
          </select>

          <label className="block text-sm font-medium text-ink-600 mb-2">Paste your text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="input resize-none"
            placeholder="Paste your essay or assignment text here..."
          />
          <button
            onClick={handleGrade}
            disabled={loading || !text.trim()}
            className="btn-primary mt-4 w-full"
          >
            {loading ? "Grading..." : "Grade with AI"}
          </button>
          {error && <p className="text-danger text-sm mt-2">{error}</p>}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-ink-600">Feedback</h2>
            {result && (
              <div className="flex gap-1">
                <button onClick={copyFeedback} className="btn-secondary !min-h-0 !py-1.5 !px-2.5 text-xs">
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <button onClick={downloadFeedback} className="btn-secondary !min-h-0 !py-1.5 !px-2.5 text-xs">
                  <Download size={13} />
                </button>
              </div>
            )}
          </div>

          {!result && !loading && (
            <p className="text-slate-400 text-sm">Your feedback report will appear here.</p>
          )}

          {loading && (
            <div className="space-y-3">
              <div className="skeleton h-10 w-24" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          )}

          {result && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-brand-600">{result.overallScore}</div>
                <div className="text-ink-600">/ 100 overall score</div>
              </div>

              {result.summary && <p className="text-ink-600 italic">{result.summary}</p>}

              {result.strengths?.length > 0 && (
                <div>
                  <p className="font-semibold text-success mb-1">Strengths</p>
                  <ul className="list-disc list-inside text-ink-600 space-y-1">
                    {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {result.improvements?.length > 0 && (
                <div>
                  <p className="font-semibold text-warning mb-1">Areas to Improve</p>
                  <ul className="list-disc list-inside text-ink-600 space-y-1">
                    {result.improvements.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {result.grammarNotes?.length > 0 && (
                <div>
                  <p className="font-semibold text-ink-900 mb-1">Grammar & Style Notes</p>
                  <ul className="list-disc list-inside text-ink-600 space-y-1">
                    {result.grammarNotes.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
