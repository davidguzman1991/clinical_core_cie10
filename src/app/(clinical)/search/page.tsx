"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch, getClinicalApiBase } from "@/lib/api";

type ClinicalSearchResult = {
  term: string;
  category: string;
  suggested_icd: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;

  const re = new RegExp(`(${escapeRegExp(q)})`, "ig");
  const parts = text.split(re);

  return parts.map((part, idx) => {
    const isMatch = part.toLowerCase() === q.toLowerCase();
    if (!isMatch) return <span key={idx}>{part}</span>;
    return (
      <mark
        key={idx}
        className="rounded px-1 bg-yellow-200/70 text-zinc-900 dark:bg-yellow-300/20 dark:text-zinc-50"
      >
        {part}
      </mark>
    );
  });
}

export default function ClinicalSearchPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClinicalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = getClinicalApiBase();
  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= 2;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!canSearch) {
      abortRef.current?.abort();
      abortRef.current = null;
      setLoading(false);
      setError(null);
      setResults([]);
      return;
    }

    if (!apiBase) {
      setError(
        "Falta configurar NEXT_PUBLIC_API_URL. Revisa tu archivo .env.local."
      );
      setResults([]);
      setLoading(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<ClinicalSearchResult[]>(
          `/clinical/search?q=${encodeURIComponent(trimmedQuery)}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }
        );
        setResults(Array.isArray(data) ? data : []);
      } catch (e) {
        if ((e as { name?: string }).name === "AbortError") return;
        setError("No se pudo buscar. Verifica tu conexión e inténtalo de nuevo.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      window.clearTimeout(handle);
    };
  }, [apiBase, canSearch, trimmedQuery]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const visibleResults = useMemo(() => {
    if (!canSearch) return [];
    return results;
  }, [canSearch, results]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">Búsqueda clínica</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Escribe un diagnóstico o término clínico. Resultados en tiempo real.
          </p>
        </div>

        <div className="sticky top-0 z-10 -mx-4 px-4 pb-3 pt-2 bg-zinc-50/90 backdrop-blur dark:bg-zinc-950/85">
          <label className="sr-only" htmlFor="clinical-search">
            Buscar
          </label>
          <div className="relative">
            <input
              id="clinical-search"
              ref={inputRef}
              type="search"
              inputMode="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Ej: diabetes, asma, hipertensión..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[16px] shadow-sm outline-none transition focus:border-zinc-300 focus:ring-4 focus:ring-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-700 dark:focus:ring-zinc-800/60"
              aria-describedby="clinical-search-help"
            />
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              {loading ? (
                <div
                  className="h-4 w-4 rounded-full border-2 border-zinc-300 border-t-transparent animate-spin dark:border-zinc-700"
                  aria-hidden="true"
                />
              ) : (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">⌘K</span>
              )}
            </div>
          </div>
          <p id="clinical-search-help" className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Mínimo 2 caracteres. Se cancelan búsquedas anteriores automáticamente.
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            API: <span className="font-medium">{apiBase ?? "undefined"}</span>
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        <div
          className="mt-4 space-y-3 scroll-smooth transition-opacity duration-200"
          style={{ opacity: loading || visibleResults.length > 0 || error ? 1 : 0.98 }}
        >
          {loading && (
            <div className="space-y-3" aria-label="Cargando resultados">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && canSearch && !error && visibleResults.length === 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              Sin resultados.
            </div>
          )}

          {!loading && visibleResults.length > 0 && (
            <div className="space-y-3">
              {visibleResults.map((item, index) => (
                <div
                  key={`${item.term}-${item.suggested_icd}-${index}`}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-transform duration-200 will-change-transform active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-semibold leading-snug">
                        {highlightMatch(item.term, trimmedQuery)}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        Categoría: <span className="font-medium">{item.category}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">ICD sugerido</p>
                      <p className="mt-1 inline-flex rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-sm font-semibold tracking-wide text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
                        {item.suggested_icd}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
