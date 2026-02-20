"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export type ICDCodeDetail = {
  code: string;
  description: string;
};

export type ICDSubcategory = {
  code: string;
  description: string;
  codes: ICDCodeDetail[];
};

export type ICDChapter = {
  range: string;
  title: string;
  subcategories: ICDSubcategory[];
};

type ICDChapterGridProps = {
  chapters: ICDChapter[];
  onSelect: (chapter: ICDChapter) => void;
};

export default function ICDChapterGrid({ chapters, onSelect }: ICDChapterGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {chapters.map((chapter, index) => (
        <motion.button
          key={chapter.range}
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.03 }}
          onClick={() => onSelect(chapter)}
          className="group rounded-2xl border border-border bg-card/80 p-3 text-left backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-turquoise-400/60 hover:shadow-[0_10px_28px_-12px_rgba(0,184,184,0.55)]"
        >
          <p className="font-mono text-xs tracking-widest text-turquoise-500">{chapter.range}</p>
          <p className="mt-1 text-sm font-medium leading-snug text-foreground">{chapter.title}</p>
          <div className="mt-3 flex justify-end text-muted-foreground transition-colors group-hover:text-turquoise-500">
            <ChevronRight className="h-4 w-4" />
          </div>
        </motion.button>
      ))}
    </div>
  );
}
