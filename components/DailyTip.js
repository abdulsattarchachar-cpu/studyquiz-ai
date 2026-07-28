"use client";

import { useEffect, useState } from "react";

const TIP_KEY = "studyquiz_daily_tip";

export default function DailyTip() {
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(true);

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

    fetch("/api/tip")
      .then((res) => res.json())
      .then((data) => {
        if (data.tip) {
          setTip(data.tip);
          localStorage.setItem(TIP_KEY, JSON.stringify({ date: today, tip: data.tip }));
        }
      })
      .catch(() => setTip("Keep a consistent study schedule — little and often beats last-minute cramming."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card bg-brand-50 border-brand-100 mb-8">
      <p className="text-xs font-semibold text-brand-600 mb-1">💡 TODAY'S STUDY TIP</p>
      <p className="text-sm text-slate-700">
        {loading ? "Loading a fresh tip..." : tip}
      </p>
    </div>
  );
}
