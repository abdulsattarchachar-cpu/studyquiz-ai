"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const NODE_STYLES = {
  start: "bg-brand-500 text-white border-brand-500",
  end: "bg-ink-900 text-white border-ink-900",
  decision: "bg-amber-50 text-ink-900 border-warning",
  process: "bg-white text-ink-900 border-line",
};

function FlowNode({ node, depth = 0 }) {
  const style = NODE_STYLES[node.nodeType] || NODE_STYLES.process;
  const hasChildren = node.children && node.children.length > 0;
  const isBranching = hasChildren && node.children.length > 1;

  return (
    <div className="flex flex-col items-center">
      {node.branchLabel && (
        <span className="badge bg-slate-100 text-ink-600 mb-1 text-xs">{node.branchLabel}</span>
      )}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: depth * 0.05 }}
        className={`px-4 py-2 rounded-control border-2 text-sm font-medium shadow-soft text-center max-w-[220px] ${style}`}
      >
        {node.label}
      </motion.div>

      {hasChildren && (
        <>
          <ChevronDown size={16} className="text-slate-300 my-1" />
          {isBranching ? (
            <div className="flex gap-6 items-start">
              {node.children.map((child, i) => (
                <FlowNode key={i} node={child} depth={depth + 1} />
              ))}
            </div>
          ) : (
            <FlowNode node={node.children[0]} depth={depth + 1} />
          )}
        </>
      )}
    </div>
  );
}

export default function Flowchart({ root }) {
  if (!root) return null;
  return (
    <div className="overflow-x-auto py-4">
      <div className="min-w-fit flex justify-center px-2">
        <FlowNode node={root} />
      </div>
    </div>
  );
}
