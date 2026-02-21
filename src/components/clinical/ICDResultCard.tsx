"use client";

import { motion } from "framer-motion";
import { Copy, Check, Star, FileText, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ICDResultCardProps = {
  code: string;
  diagnosisName: string;
  copied: boolean;
  isFavorite: boolean;
  isSelected: boolean;
  onCopy: (code: string, diagnosisName: string) => void;
  onSelect: (code: string) => void;
  onToggleFavorite: (code: string) => void;
  index?: number;
};

export default function ICDResultCard({
  code,
  diagnosisName,
  copied,
  isFavorite,
  isSelected,
  onCopy,
  onSelect,
  onToggleFavorite,
  index = 0,
}: ICDResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-3 transition-all duration-200 sm:p-4",
        "hover:border-turquoise-300/55 hover:shadow-[0_8px_22px_-14px_rgba(0,184,184,0.5)]",
        isSelected
          ? "border-turquoise-400/60 bg-turquoise-50/30 dark:border-turquoise-600/40 dark:bg-turquoise-900/10"
          : "border-border"
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gradient-to-br from-turquoise-500/[0.06] to-purple-ai-500/[0.06] blur-xl transition-opacity group-hover:opacity-100 opacity-0" />

      <div className="relative min-w-0">
        <div className="mb-2.5 flex min-w-0 items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Badge variant="default" className="font-mono text-[11px] tracking-widest">
              {code}
            </Badge>
            {isSelected && (
              <Badge variant="success" className="text-[10px]">
                Seleccionado
              </Badge>
            )}
          </div>
        </div>

        <h3 className="mb-2 line-clamp-2 min-w-0 break-words text-[14px] font-semibold leading-snug text-foreground sm:text-[15px]">
          {diagnosisName}
        </h3>

        <div className="space-y-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(code)}
            className={cn(
              "flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all",
              isSelected
                ? "bg-turquoise-500 text-white"
                : "bg-gradient-to-r from-turquoise-500 to-purple-ai-500 text-white"
            )}
          >
            <FileText className="h-4 w-4" />
            <span>Usar en receta</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </motion.button>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onCopy(code, diagnosisName)}
              aria-live="polite"
              className={cn(
                "flex h-9 items-center justify-center gap-2 rounded-xl border text-xs font-medium transition-all sm:h-10 sm:flex-1 sm:text-sm",
                copied
                  ? "border-turquoise-300 bg-turquoise-50 text-turquoise-700 dark:border-turquoise-700 dark:bg-turquoise-900/20 dark:text-turquoise-300"
                  : "border-border bg-card text-foreground hover:border-turquoise-300 hover:bg-turquoise-50/50 dark:hover:bg-turquoise-900/20"
              )}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copiado" : "Copiar"}</span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleFavorite(code)}
              aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              aria-pressed={isFavorite}
              className={cn(
                "flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-medium transition-all sm:h-10 sm:min-w-28 sm:text-sm",
                isFavorite
                  ? "border-amber-300/70 bg-amber-50 text-amber-600 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300"
                  : "bg-card text-muted-foreground hover:border-turquoise-300 hover:text-foreground"
              )}
            >
              <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
              <span>Favorito</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
