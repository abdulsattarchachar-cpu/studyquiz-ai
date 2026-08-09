"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, Plus, CheckCircle2, Trash2, Inbox, Sparkles, Award } from "lucide-react";
import { useToast } from "../../components/ToastProvider";
import { logActivity, recordActivity } from "../../lib/stats";
import {
  getAllTopics,
  addTopic,
  markDone,
  removeTopic,
  getDueToday,
  getUpcoming,
  getMastered,
  STAGE_LABELS,
} from "../../lib/revision";

const SUBJECT_SUGGESTIONS = [
  "Data Structures",
  "Digital Logic Design",
  "Computer Networks",
  "Software Engineering",
  "Ideology & Constitution of Pakistan",
];

const STAGE_STYLES = {
  0: "bg-amber-50 text-warning",
  1: "bg-brand-50 text-brand-600",
  2: "bg-green-50 text-success",
};

function daysOverdue(nextDue) {
  const today = new Date().toISOString().split("T")[0];
  const diff = Math.round((new Date(today) - new Date(nextDue)) / 86400000);
  return diff;
}

export default function RevisionPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [dueToday, setDueToday] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [mastered, setMastered] = useState([]);
  const [showMastered, setShowMastered] = useState(false);
  const [loaded, setLoaded] = useState(false);

  function refresh() {
    setDueToday(getDueToday());
    setUpcoming(getUpcoming());
    setMastered(getMastered());
  }

  useEffect(() => {
    refresh();
    setLoaded(true);
  }, []);

  function handleAdd(e) {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) return;
    addTopic({ subject, topic });
    recordActivity();
    logActivity("revision", `Added "${topic}" (${subject}) to revision tracker`);
    setTopic("");
    refresh();
    toast(`"${topic}" scheduled for Day-3 recall`);
  }

  function handleMarkDone(item) {
    markDone(item.id);
    recordActivity();
    const wasFirstReview = item.stage === 0;
    logActivity(
      "revision",
      wasFirstReview
        ? `Completed Day-3 recall for "${item.topic}" — next up in 7 days`
        : `Mastered "${item.topic}" after Day-7 recall 🎉`
    );
    refresh();
    toast(wasFirstReview ? "Nice — see you in 7 days for the final recall" : "Topic mastered! 🎉");
  }

  function handleRemove(id) {
    removeTopic(id);
    refresh();
    toast("Removed", "info");
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <CalendarClock className="text-brand-600" size={22} />
        <h1 className="text-[26px] font-semibold text-ink-900">Revision Tracker</h1>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Add a topic the day you study it — this tracks Day-3 and Day-7 recall for you automatically,
        so you never have to remember what's due.
      </p>

      {/* Add topic form */}
      <form onSubmit={handleAdd} className="card mb-6 flex flex-col sm:flex-row gap-3">
        <input
          list="subject-suggestions"
          type="text"
          placeholder="Subject (e.g. Data Structures)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input sm:w-64"
        />
        <datalist id="subject-suggestions">
          {SUBJECT_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <input
          type="text"
          placeholder="Topic (e.g. Linked Lists — insertion & deletion)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="input flex-1"
        />
        <button type="submit" disabled={!subject.trim() || !topic.trim()} className="btn-primary whitespace-nowrap">
          <Plus size={16} /> Add Topic
        </button>
      </form>

      {/* Due Today */}
      <div className="mb-8">
        <h2 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-brand-600" />
          Due Today {dueToday.length > 0 && <span className="badge bg-danger/10 text-danger">{dueToday.length}</span>}
        </h2>

        {loaded && dueToday.length === 0 && (
          <div className="card flex flex-col items-center text-center py-8 text-slate-400">
            <Inbox size={28} className="mb-2" />
            <p className="text-sm">Nothing due today — add a topic above whenever you study something new.</p>
          </div>
        )}

        <div className="space-y-2">
          <AnimatePresence>
            {dueToday.map((t) => {
              const overdue = daysOverdue(t.nextDue);
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="card !p-4 flex items-center justify-between border-brand-100 bg-brand-50/40"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 truncate">{t.topic}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-slate-400">{t.subject}</span>
                      <span className={`badge text-xs ${STAGE_STYLES[t.stage]}`}>{STAGE_LABELS[t.stage]}</span>
                      {overdue > 0 && (
                        <span className="badge bg-red-50 text-danger text-xs">{overdue}d overdue</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleMarkDone(t)} className="btn-primary !min-h-0 !py-1.5 !px-3 text-xs shrink-0 ml-2">
                    <CheckCircle2 size={14} /> Mark Done
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Upcoming */}
      <div className="mb-8">
        <h2 className="font-semibold text-ink-900 mb-3">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="text-slate-400 text-sm">No upcoming reviews scheduled.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((t) => (
              <div key={t.id} className="card !p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900 truncate">{t.topic}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-slate-400">{t.subject}</span>
                    <span className={`badge text-xs ${STAGE_STYLES[t.stage]}`}>{STAGE_LABELS[t.stage]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400">Due {t.nextDue}</span>
                  <button onClick={() => handleRemove(t.id)} className="btn-danger-ghost !min-h-0 !p-2">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mastered (collapsible) */}
      {mastered.length > 0 && (
        <div>
          <button
            onClick={() => setShowMastered(!showMastered)}
            className="flex items-center gap-2 font-semibold text-ink-900 mb-3"
          >
            <Award size={16} className="text-success" />
            Mastered ({mastered.length}) {showMastered ? "▲" : "▼"}
          </button>
          <AnimatePresence>
            {showMastered && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-2"
              >
                {mastered.map((t) => (
                  <div key={t.id} className="card !p-3 flex items-center justify-between opacity-70">
                    <div>
                      <p className="text-sm text-ink-900">{t.topic}</p>
                      <span className="text-xs text-slate-400">{t.subject}</span>
                    </div>
                    <button onClick={() => handleRemove(t.id)} className="btn-danger-ghost !min-h-0 !p-2">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
