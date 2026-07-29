"use client";

import { motion } from "framer-motion";

const COLORS = ["#4F6DF5", "#22C55E", "#F59E0B", "#06B6D4", "#EF4444"];

export default function Confetti({ count = 24 }) {
  const pieces = Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 1.2 + Math.random() * 0.8,
    color: COLORS[i % COLORS.length],
    rotate: Math.random() * 360,
    size: 6 + Math.random() * 6,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ top: "-5%", left: `${p.left}%`, opacity: 1, rotate: 0 }}
          animate={{ top: "105%", opacity: 0, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
