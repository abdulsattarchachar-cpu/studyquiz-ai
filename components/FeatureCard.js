"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FeatureCard({ href, icon: Icon, title, description, stat }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.15 }}>
      <Link href={href} className="card card-hover block group h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-control bg-brand-50 flex items-center justify-center">
            <Icon className="text-brand-600" size={20} />
          </div>
          <ArrowRight
            size={18}
            className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all mt-1"
          />
        </div>
        <h2 className="font-semibold text-base text-ink-900 mb-1">{title}</h2>
        <p className="text-ink-600 text-sm leading-relaxed">{description}</p>
        {stat && (
          <p className="text-xs font-medium text-brand-600 mt-3">{stat}</p>
        )}
      </Link>
    </motion.div>
  );
}
