"use client";

import { motion } from "framer-motion";

const COLORS = ["border-brand-500", "border-cyan-500", "border-amber-500", "border-emerald-500", "border-pink-500"];

function Branch({ node, depth = 0, colorIndex = 0 }) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex items-center">
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: depth * 0.05 }}
        className={`px-3 py-2 rounded-control border-2 bg-white text-sm font-medium text-ink-900 shadow-soft whitespace-nowrap ${
          depth === 0 ? "border-brand-500 bg-brand-50 font-semibold" : COLORS[colorIndex % COLORS.length]
        }`}
      >
        {node.label}
      </motion.div>

      {hasChildren && (
        <div className="flex items-center">
          <div className="w-6 h-px bg-line shrink-0" />
          <div className="flex flex-col gap-3 border-l-2 border-line pl-0">
            {node.children.map((child, i) => (
              <div key={i} className="flex items-center">
                <div className="w-4 h-px bg-line -ml-0.5" />
                <Branch node={child} depth={depth + 1} colorIndex={i} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MindMap({ root }) {
  if (!root) return null;
  return (
    <div className="overflow-x-auto py-4">
      <div className="min-w-fit px-2">
        <Branch node={root} />
      </div>
    </div>
  );
}
