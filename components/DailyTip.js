"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCcw } from "lucide-react";

const TIP_KEY = "studyquiz_daily_tip";

export default function DailyTip() {
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function fetchFreshTip(dateForCache) {
    return fetch("/api/tip")
      .then((res) => res.json())
      .then((data) => {
        if (data.tip) {
          setTip(data.tip);
          localStorage.setItem(TIP_KEY, JSON.stringify({ date: dateForCache, tip: data.tip }));
        }
      })
      .catch(() =>
        setTip("Keep a consistent study schedule — little and often beats last-minute cramming.")
      );
  }

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    try {
      const saved = localStorage.getItem(TIP_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          setTip(parsed.tip);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      // ignore and fetch fresh
    }

    fetchFreshTip(today).finally(() => setLoading(false));
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    const today = new Date().toISOString().split("T")[0];
    await fetchFreshTip(today);
    setRefreshing(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-card border border-brand-100 bg-brand-50 p-5 mb-8 flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-control bg-white flex items-center justify-center shrink-0 shadow-soft">
        <Sparkles className="text-brand-600" size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-brand-600 tracking-wide mb-1">TODAY'S STUDY TIP</p>
        {loading ? (
          <div className="skeleton h-4 w-64 max-w-full" />
        ) : (
          <p className="text-sm text-ink-900">{tip}</p>
        )}
      </div>
      <button
        onClick={handleRefresh}
        disabled={loading || refreshing}
        className="shrink-0 p-1.5 rounded-control hover:bg-white text-brand-600 transition-colors disabled:opacity-40"
        title="Refresh tip"
      >
        <RefreshCcw size={14} className={refreshing ? "animate-spin" : ""} />
      </button>
    </motion.div>
  );
}
