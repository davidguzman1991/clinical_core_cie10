"use client";

import { motion } from "framer-motion";
import { Copy, Scissors } from "lucide-react";

import type { ICDCodeDetail } from "./ICDChapterGrid";

type ICDCodeListProps = {
  items: ICDCodeDetail[];
  onCopyFull: (item: ICDCodeDetail) => void;
  onCopyCode: (item: ICDCodeDetail) => void;
};

export default function ICDCodeList({ items, onCopyFull, onCopyCode }: ICDCodeListProps) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={item.code}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: index * 0.02 }}
          className="rounded-xl border border-border bg-card/80 p-3 backdrop-blur-sm transition hover:border-turquoise-400/60 hover:shadow-[0_8px_22px_-12px_rgba(0,184,184,0.55)]"
        >
          <p className="font-mono text-xs tracking-wider text-turquoise-500">{item.code}</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{item.description}</p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCopyFull(item)}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card text-xs font-medium text-foreground transition hover:border-turquoise-300 hover:bg-turquoise-50/40 dark:hover:bg-turquoise-900/20"
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar texto
            </button>

            <button
              type="button"
              onClick={() => onCopyCode(item)}
              aria-label="Copiar solo código"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-turquoise-300 hover:text-foreground"
            >
              <Scissors className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
