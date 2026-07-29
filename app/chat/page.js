"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Copy, Check, RotateCcw } from "lucide-react";

const SUGGESTIONS = [
  "Explain recursion with a simple example",
  "What's the difference between TCP and UDP?",
  "Help me understand Newton's second law",
  "Summarize the causes of World War 1",
];

function renderContent(content) {
  // Minimal code-block support: split on ``` fences, no external markdown lib
  const parts = content.split(/```/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <pre key={i} className="bg-ink-900 text-slate-100 rounded-control p-3 text-xs overflow-x-auto my-2 font-mono">
        {part.trim()}
      </pre>
    ) : (
      <span key={i} className="whitespace-pre-wrap">{part}</span>
    )
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(e, presetText) {
    if (e) e.preventDefault();
    const text = (presetText ?? input).trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text, time: Date.now() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get a response");
      setMessages([...newMessages, { role: "assistant", content: data.reply, time: Date.now() }]);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  }

  function regenerate() {
    if (messages.length < 1 || loading) return;
    const withoutLast = messages[messages.length - 1].role === "assistant" ? messages.slice(0, -1) : messages;
    setMessages(withoutLast);
    setLoading(true);
    setError("");
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: withoutLast.map(({ role, content }) => ({ role, content })) }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages([...withoutLast, { role: "assistant", content: data.reply, time: Date.now() }]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  function copyMessage(content, idx) {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1200);
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex flex-col h-[75vh]">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="text-brand-600" size={22} />
        <h1 className="text-[26px] font-semibold text-ink-900">Doubt Solver</h1>
      </div>

      <div className="card flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <div>
            <p className="text-slate-400 text-sm mb-3">
              Ask any study question — concepts, homework doubts, exam prep, anything.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(null, s)}
                  className="badge bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`group max-w-[85%] ${m.role === "user" ? "ml-auto" : ""}`}
            >
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user" ? "bg-brand-500 text-white" : "bg-slate-100 text-ink-900"
                }`}
              >
                {renderContent(m.content)}
              </div>
              <div
                className={`flex items-center gap-2 mt-1 text-xs text-slate-400 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <span>{formatTime(m.time)}</span>
                <button
                  onClick={() => copyMessage(m.content, i)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-ink-900"
                >
                  {copiedIdx === i ? <Check size={12} /> : <Copy size={12} />}
                </button>
                {m.role === "assistant" && i === messages.length - 1 && (
                  <button
                    onClick={regenerate}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-ink-900"
                  >
                    <RotateCcw size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="bg-slate-100 rounded-2xl px-4 py-3 max-w-[85%] flex gap-1 items-center">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-slate-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-danger text-sm mb-2">{error}</p>}

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="input flex-1"
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary">
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
}
