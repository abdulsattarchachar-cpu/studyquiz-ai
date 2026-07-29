import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, loading }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="card !p-4 sm:!p-5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-control bg-brand-50 flex items-center justify-center shrink-0">
        <Icon className="text-brand-600" size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-600 truncate">{label}</p>
        {loading ? (
          <div className="skeleton h-5 w-10 mt-1" />
        ) : (
          <p className="text-xl font-semibold text-ink-900 leading-tight">{value}</p>
        )}
      </div>
    </motion.div>
  );
}
