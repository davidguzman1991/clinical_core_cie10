"use client";

import { motion } from "framer-motion";

type SkeletonProps = {
  lines?: number;
};

export default function Skeleton({ lines = 4 }: SkeletonProps) {
  return (
    <div className="space-y-3" aria-label="Cargando resultados" role="status">
      {Array.from({ length: lines }).map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.06 }}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-6 w-20 rounded-full bg-muted animate-shimmer" />
              <div className="h-4 w-4 rounded bg-muted animate-shimmer" />
            </div>
            <div className="h-4 w-4/5 rounded-lg bg-muted animate-shimmer" />
            <div className="h-3 w-3/5 rounded-lg bg-muted animate-shimmer" />
            <div className="flex gap-2 pt-1">
              <div className="h-10 flex-1 rounded-xl bg-muted animate-shimmer" />
              <div className="h-10 flex-1 rounded-xl bg-muted animate-shimmer" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
