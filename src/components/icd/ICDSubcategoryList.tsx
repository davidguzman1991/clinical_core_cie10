"use client";

import { motion } from "framer-motion";
import { ChevronRight, Search } from "lucide-react";

import type { ICDSubcategory } from "./ICDChapterGrid";

type ICDSubcategoryListProps = {
  query: string;
  onQueryChange: (value: string) => void;
  items: ICDSubcategory[];
  onSelect: (item: ICDSubcategory) => void;
};

export default function ICDSubcategoryList({
  query,
  onQueryChange,
  items,
  onSelect,
}: ICDSubcategoryListProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar dentro del capítulo"
          className="h-11 w-full rounded-xl border border-border bg-card/80 pl-10 pr-3 text-sm text-foreground outline-none backdrop-blur-sm transition focus:border-turquoise-400 focus:ring-4 focus:ring-turquoise-500/15"
        />
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.button
            key={item.code}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            onClick={() => onSelect(item)}
            className="group flex w-full items-center justify-between rounded-xl border border-border bg-card/80 px-3 py-3 text-left transition-all hover:border-turquoise-400/60 hover:shadow-[0_8px_22px_-12px_rgba(0,184,184,0.55)]"
          >
            <div>
              <p className="font-mono text-xs tracking-wider text-turquoise-500">{item.code}</p>
              <p className="mt-0.5 text-sm text-foreground">{item.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-turquoise-500" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
