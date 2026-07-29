"use client";

import { motion } from "framer-motion";
import CountUp from "./CountUp";

export default function StatCard({ icon: Icon, label, value, suffix = "", progress, loading }) {
  const isNumber = typeof value === "number";

  return (
    <motion.div whileHover={{ y: -2 }} className="card !p-4 sm:!p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-control bg-brand-50 flex items-center justify-center shrink-0">
          <Icon className="text-brand-600" size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-ink-600 truncate">{label}</p>
          {loading ? (
            <div className="skeleton h-5 w-10 mt-1" />
          ) : (
            <p className="text-xl font-semibold text-ink-900 leading-tight">
              {isNumber ? <CountUp value={value} suffix={suffix} /> : value}
            </p>
          )}
        </div>
      </div>
      {typeof progress === "number" && !loading && (
        <div className="h-1.5 bg-slate-100 rounded-pill mt-3 overflow-hidden">
          <motion.div
            className="h-full bg-brand-500 rounded-pill"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      )}
    </motion.div>
  );
}
