"use client";

import { motion } from "framer-motion";
import { BookOpen, AlertTriangle, Shield, Heart } from "lucide-react";

type EvidenceItem = {
  title: string;
  source: string;
  icon: React.ReactNode;
  color: string;
};

const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    title: "Guías ADA 2024",
    source: "Diabetes Care",
    icon: <BookOpen className="h-4 w-4" />,
    color: "text-turquoise-500",
  },
  {
    title: "Red Flags",
    source: "Signos de alarma",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "text-amber-500",
  },
  {
    title: "Guías IDSA",
    source: "Infectología",
    icon: <Shield className="h-4 w-4" />,
    color: "text-purple-ai-500",
  },
  {
    title: "Guías ESC",
    source: "Cardiología",
    icon: <Heart className="h-4 w-4" />,
    color: "text-rose-500",
  },
];

export default function EvidenceCards() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="mx-auto mt-6 w-full max-w-2xl"
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <BookOpen className="h-3.5 w-3.5 text-turquoise-500" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Evidencia clínica
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {EVIDENCE_ITEMS.map((item, idx) => (
          <motion.button
            key={item.title}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.75 + idx * 0.06 }}
            whileTap={{ scale: 0.96 }}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-turquoise-200 hover:shadow-[0_4px_16px_-4px_var(--shadow-color)] dark:hover:border-turquoise-800/40"
          >
            <div className={`${item.color} transition-transform group-hover:scale-110`}>
              {item.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-tight">{item.title}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{item.source}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
