"use client";

import { useEffect, useRef } from "react";

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

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <div className="relative">
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
        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-24 text-[16px] shadow-sm outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-700 dark:focus:ring-zinc-800/60"
        aria-busy={loading}
      />

      <div className="absolute inset-y-0 right-2 flex items-center gap-2">
        {value.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg px-2 py-2 text-sm text-zinc-600 hover:bg-zinc-100 active:scale-[0.99] dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Limpiar búsqueda"
          >
            Limpiar
          </button>
        )}

        {loading && (
          <div
            className="h-4 w-4 rounded-full border-2 border-zinc-300 border-t-transparent animate-spin dark:border-zinc-700"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
