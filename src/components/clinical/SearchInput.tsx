"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Loader2 } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder: string;
  loading?: boolean;
  autoFocus?: boolean;
};

export default function SearchInput({
  value,
  onChange,
  onClear,
  placeholder,
  loading = false,
  autoFocus = true,
}: SearchInputProps) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="relative mx-auto w-full max-w-2xl"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border bg-card shadow-[0_4px_20px_-4px_var(--shadow-color)] transition-all duration-300 ${
          isFocused
            ? "border-turquoise-400/60 shadow-[0_8px_32px_-6px_rgba(0,184,184,0.25)] dark:border-turquoise-500/40 dark:shadow-[0_8px_32px_-6px_rgba(0,184,184,0.15)]"
            : "border-border"
        }`}
      >
        {isFocused && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-turquoise-500/5 via-transparent to-purple-ai-500/5" />
        )}

        <div className="relative flex items-center">
          <div className="flex items-center pl-4">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className="h-5 w-5 animate-spin text-turquoise-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Sparkles className="h-5 w-5 text-turquoise-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <label className="sr-only" htmlFor="clinical-search">
            Buscar diagnóstico
          </label>
          <input
            id="clinical-search"
            ref={ref}
            type="search"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 bg-transparent px-3 py-4 text-[16px] text-foreground placeholder:text-muted-foreground/60 outline-none"
            aria-busy={loading}
          />

          <div className="flex items-center gap-1 pr-3">
            <AnimatePresence>
              {value.length > 0 && (
                <motion.button
                  type="button"
                  onClick={onClear}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>

            <div className="flex h-8 items-center rounded-lg bg-gradient-to-r from-turquoise-500/10 to-purple-ai-500/10 px-2.5">
              <Search className="h-3.5 w-3.5 text-turquoise-600 dark:text-turquoise-400" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
