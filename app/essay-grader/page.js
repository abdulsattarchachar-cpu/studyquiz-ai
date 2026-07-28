"use client";

import { useState } from "react";

export default function EssayGraderPage() {
  const [text, setText] = useState("");
  const [assignmentType, setAssignmentType] = useState("Essay");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Essay / Assignment Grader</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <label className="block text-sm font-medium text-slate-600 mb-2">Assignment type</label>
          <select
            value={assignmentType}
            onChange={(e) => setAssignmentType(e.target.value)}
            className="input mb-3"
          >
            <option>Essay</option>
            <option>Report</option>
            <option>Research Paper Excerpt</option>
            <option>Short Answer</option>
            <option>Cover Letter</option>
          </select>

          <label className="block text-sm font-medium text-slate-600 mb-2">
            Paste your text
          </label>
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
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="card">
          <h2 className="text-sm font-medium text-slate-600 mb-3">Feedback</h2>
          {!result && !loading && (
            <p className="text-slate-400 text-sm">Your feedback report will appear here.</p>
          )}
          {loading && <p className="text-slate-400 text-sm">Analyzing your writing...</p>}
          {result && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-brand-600">{result.overallScore}</div>
                <div className="text-slate-500">/ 100 overall score</div>
              </div>

              {result.summary && (
                <p className="text-slate-600 italic">{result.summary}</p>
              )}

              {result.strengths?.length > 0 && (
                <div>
                  <p className="font-semibold text-green-700 mb-1">Strengths</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {result.improvements?.length > 0 && (
                <div>
                  <p className="font-semibold text-amber-700 mb-1">Areas to Improve</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {result.improvements.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}

              {result.grammarNotes?.length > 0 && (
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Grammar & Style Notes</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
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
