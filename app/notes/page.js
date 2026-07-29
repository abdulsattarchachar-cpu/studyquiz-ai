"use client";

import { useState } from "react";
import { NotebookText, Copy, Download, Check } from "lucide-react";
import { useToast } from "../../components/ToastProvider";

const LANGUAGES = ["Same as input", "English", "Urdu", "Roman Urdu", "Spanish", "French", "Arabic"];

export default function NotesPage() {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState("summary");
  const [language, setLanguage] = useState("Same as input");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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

  function copySummary() {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast("Summary copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadSummary() {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <NotebookText className="text-brand-600" size={22} />
        <h1 className="text-[26px] font-semibold text-ink-900">AI Notes Summarizer</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex gap-3 flex-col sm:flex-row mb-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink-600 mb-1.5">Mode</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)} className="input">
                <option value="summary">Standard Summary</option>
                <option value="eli5">Explain Like I'm 5 (ELI5)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-ink-600 mb-1.5">Output Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input">
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="block text-sm font-medium text-ink-600 mb-1.5">
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
          {error && <p className="text-danger text-sm mt-2">{error}</p>}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-ink-600">Summary</h2>
            {summary && (
              <div className="flex gap-1.5">
                <button onClick={copySummary} className="btn-secondary !min-h-0 !py-1.5 !px-2.5 text-xs">
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={downloadSummary} className="btn-secondary !min-h-0 !py-1.5 !px-2.5 text-xs">
                  <Download size={13} /> Download
                </button>
              </div>
            )}
          </div>

          {!summary && !loading && (
            <p className="text-slate-400 text-sm">Your AI-generated summary will appear here.</p>
          )}
          {loading && (
            <div className="space-y-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          )}
          {summary && (
            <div className="whitespace-pre-wrap text-ink-600 text-sm leading-relaxed">
              {summary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
