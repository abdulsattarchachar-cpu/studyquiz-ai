"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES = {
  success: "bg-white border-line text-ink-900",
  error: "bg-white border-line text-ink-900",
  info: "bg-white border-line text-ink-900",
};

const ICON_COLORS = {
  success: "text-success",
  error: "text-danger",
  info: "text-info",
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fail gracefully if used outside provider
    return { toast: () => {} };
  }
  return ctx;
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className={`flex items-start gap-2.5 rounded-control border shadow-lift px-4 py-3 text-sm ${STYLES[t.type]}`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 mt-0.5 ${ICON_COLORS[t.type]}`} size={18} />
                <span className="flex-1">{t.message}</span>
                <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-ink-900">
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
