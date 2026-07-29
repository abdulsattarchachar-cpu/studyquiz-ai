"use client";

import { useState } from "react";
import { NotebookText, Copy, Download, Check, GitBranch, Workflow, AlignLeft } from "lucide-react";
import { useToast } from "../../components/ToastProvider";
import { logActivity, recordActivity } from "../../lib/stats";
import MindMap from "../../components/MindMap";
import Flowchart from "../../components/Flowchart";

const LANGUAGES = ["Same as input", "English", "Urdu", "Roman Urdu", "Spanish", "French", "Arabic"];
const VIEWS = [
  { id: "summary", label: "Summary", icon: AlignLeft },
  { id: "mindmap", label: "Mind Map", icon: GitBranch },
  { id: "flowchart", label: "Flowchart", icon: Workflow },
];

export default function NotesPage() {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState("summary");
  const [language, setLanguage] = useState("Same as input");
  const [view, setView] = useState("summary");
  const [summary, setSummary] = useState("");
  const [visualData, setVisualData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!notes.trim()) return;
    setLoading(true);
    setError("");
    setSummary("");
    setVisualData(null);

    try {
      if (view === "summary") {
        const res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes, mode, language }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to summarize");
        setSummary(data.summary);
      } else {
        const res = await fetch("/api/notes-visual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes, type: view }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to generate visual");
        setVisualData(data.root);
      }
      recordActivity();
      logActivity("notes", `Summarized notes (${view === "summary" ? mode : view} view)`);
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

      {/* View toggle */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-control p-1 w-fit">
        {VIEWS.map((v) => {
          const Icon = v.icon;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-sm font-medium transition-colors ${
                view === v.id ? "bg-white shadow-soft text-brand-600" : "text-ink-600"
              }`}
            >
              <Icon size={14} /> {v.label}
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          {view === "summary" && (
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
          )}

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
          <button onClick={handleGenerate} disabled={loading || !notes.trim()} className="btn-primary mt-4 w-full">
            {loading
              ? "Generating..."
              : view === "summary"
              ? "Summarize with AI"
              : view === "mindmap"
              ? "Generate Mind Map"
              : "Generate Flowchart"}
          </button>
          {error && <p className="text-danger text-sm mt-2">{error}</p>}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-ink-600">
              {view === "summary" ? "Summary" : view === "mindmap" ? "Mind Map" : "Flowchart"}
            </h2>
            {view === "summary" && summary && (
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

          {!summary && !visualData && !loading && (
            <p className="text-slate-400 text-sm">
              {view === "summary"
                ? "Your AI-generated summary will appear here."
                : "Your visual will appear here."}
            </p>
          )}
          {loading && (
            <div className="space-y-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          )}
          {view === "summary" && summary && (
            <div className="whitespace-pre-wrap text-ink-600 text-sm leading-relaxed">{summary}</div>
          )}
          {view === "mindmap" && visualData && <MindMap root={visualData} />}
          {view === "flowchart" && visualData && <Flowchart root={visualData} />}
        </div>
      </div>
    </div>
  );
}
