"use client";

import { useState } from "react";

const LANGUAGES = ["Same as input", "English", "Urdu", "Roman Urdu", "Spanish", "French", "Arabic"];

export default function NotesPage() {
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState("summary");
  const [language, setLanguage] = useState("Same as input");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSummarize() {
    if (!notes.trim()) return;
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, mode, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to summarize");
      setSummary(data.summary);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">AI Notes Summarizer</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex gap-3 flex-col sm:flex-row mb-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Mode</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)} className="input">
                <option value="summary">Standard Summary</option>
                <option value="eli5">Explain Like I'm 5 (ELI5)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Output Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input">
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="block text-sm font-medium text-slate-600 mb-2">
            Paste your notes or lecture text
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={12}
            className="input resize-none"
            placeholder="Paste long notes here..."
          />
          <button
            onClick={handleSummarize}
            disabled={loading || !notes.trim()}
            className="btn-primary mt-4 w-full"
          >
            {loading ? "Summarizing..." : "Summarize with AI"}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="card">
          <h2 className="text-sm font-medium text-slate-600 mb-2">Summary</h2>
          {!summary && !loading && (
            <p className="text-slate-400 text-sm">Your AI-generated summary will appear here.</p>
          )}
          {loading && <p className="text-slate-400 text-sm">Thinking...</p>}
          {summary && (
            <div className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">
              {summary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
