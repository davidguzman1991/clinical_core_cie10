"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Scissors } from "lucide-react";

import type { ICDCodeDetail } from "./ICDChapterGrid";

const PAGE_SIZE = 20;

type ICDCodeListProps = {
  items: ICDCodeDetail[];
  onCopyFull: (item: ICDCodeDetail) => void;
  onCopyCode: (item: ICDCodeDetail) => void;
};

export default function ICDCodeList({ items, onCopyFull, onCopyCode }: ICDCodeListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [items]);

  const visibleResults = items.slice(0, visibleCount);

  return (
    <div className="space-y-2">
      <p className="mb-2 text-sm text-gray-400">
        Mostrando {visibleResults.length} de {items.length} resultados
      </p>

      {visibleResults.map((item, index) => (
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

      {items.length > visibleCount && (
        <button
          type="button"
          onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
          className="mt-4 w-full rounded-lg bg-teal-600 py-2 transition hover:bg-teal-500"
        >
          Mostrar más
        </button>
      )}
    </div>
  );
}
