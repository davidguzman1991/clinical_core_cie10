"use client";

import { motion } from "framer-motion";
import { Copy, Check, Star, FileText, ChevronRight, Scissors } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ICDResultCardProps = {
  code: string;
  diagnosisName: string;
  shortDescription: string;
  copied: boolean;
  isFavorite: boolean;
  isSelected: boolean;
  onCopy: (code: string, diagnosisName: string) => void;
  onCopyCodeOnly: (code: string) => void;
  onSelect: (code: string) => void;
  onToggleFavorite: (code: string) => void;
  index?: number;
};

export default function ICDResultCard({
  code,
  diagnosisName,
  shortDescription,
  copied,
  isFavorite,
  isSelected,
  onCopy,
  onCopyCodeOnly,
  onSelect,
  onToggleFavorite,
  index = 0,
}: ICDResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-4 transition-all duration-300",
        "hover:shadow-[0_8px_28px_-8px_var(--shadow-heavy)] hover:-translate-y-0.5",
        isSelected
          ? "border-turquoise-400/60 bg-turquoise-50/30 dark:border-turquoise-600/40 dark:bg-turquoise-900/10"
          : "border-border"
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gradient-to-br from-turquoise-500/[0.06] to-purple-ai-500/[0.06] blur-xl transition-opacity group-hover:opacity-100 opacity-0" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-mono text-[11px] tracking-widest">
              {code}
            </Badge>
            {isSelected && (
              <Badge variant="success" className="text-[10px]">
                Seleccionado
              </Badge>
            )}
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={() => onToggleFavorite(code)}
            aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            aria-pressed={isFavorite}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
              isFavorite
                ? "bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Star
              className={cn("h-[18px] w-[18px] transition-all", isFavorite && "fill-current")}
            />
          </motion.button>
        </div>

        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground mb-1">
          {diagnosisName}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed mb-4">
          {shortDescription}
        </p>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onCopy(code, diagnosisName)}
            aria-live="polite"
            className={cn(
              "flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all",
              copied
                ? "border-turquoise-300 bg-turquoise-50 text-turquoise-700 dark:border-turquoise-700 dark:bg-turquoise-900/20 dark:text-turquoise-300"
                : "border-border bg-card text-foreground hover:border-turquoise-300 hover:bg-turquoise-50/50 dark:hover:bg-turquoise-900/20"
            )}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>{copied ? "Copiado" : "Copiar texto"}</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onCopyCodeOnly(code)}
            aria-label="Copiar solo código"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:border-turquoise-300 hover:bg-turquoise-50/50 hover:text-foreground dark:hover:bg-turquoise-900/20"
          >
            <Scissors className="h-4 w-4" />
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(code)}
            className={cn(
              "flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all",
              isSelected
                ? "bg-turquoise-500 text-white shadow-[0_4px_12px_-4px_rgba(0,184,184,0.4)]"
                : "bg-gradient-to-r from-turquoise-500 to-purple-ai-500 text-white shadow-[0_4px_12px_-4px_rgba(108,99,255,0.3)] hover:shadow-[0_6px_18px_-4px_rgba(108,99,255,0.4)]"
            )}
          >
            <FileText className="h-4 w-4" />
            <span>Usar en receta</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
