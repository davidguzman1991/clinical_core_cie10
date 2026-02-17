"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

type QuickExamplesProps = {
  onSelect: (query: string) => void;
};

const EXAMPLES = [
  "Diabetes tipo 2",
  "Dolor torácico",
  "Infección urinaria",
  "Hipertensión arterial",
  "Neumonía",
  "Asma bronquial",
];

export default function QuickExamples({ onSelect }: QuickExamplesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.55 }}
      className="mx-auto mt-4 w-full max-w-2xl"
    >
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <TrendingUp className="h-3.5 w-3.5 text-turquoise-500" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Búsquedas frecuentes
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example, idx) => (
          <motion.button
            key={example}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 + idx * 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(example)}
            className="rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground transition-all hover:border-turquoise-300 hover:bg-turquoise-50/50 hover:text-turquoise-700 active:bg-turquoise-100/50 dark:hover:bg-turquoise-900/20 dark:hover:text-turquoise-300"
          >
            {example}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
