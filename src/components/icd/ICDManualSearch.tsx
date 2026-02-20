"use client";

import { Loader2, Search, Copy, Scissors } from "lucide-react";

export type ManualICDResult = {
  code: string;
  description: string;
};

type ICDManualSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  loading: boolean;
  error: string | null;
  results: ManualICDResult[];
  total: number;
  onCopyFull: (item: ManualICDResult) => void;
  onCopyCodeOnly: (item: ManualICDResult) => void;
  onLoadMore: () => void;
  canLoadMore: boolean;
};

export default function ICDManualSearch({
  query,
  onQueryChange,
  loading,
  error,
  results,
  total,
  onCopyFull,
  onCopyCodeOnly,
  onLoadMore,
  canLoadMore,
}: ICDManualSearchProps) {
  const hasQuery = query.trim().length > 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar código o diagnóstico en todo CIE-10..."
          className="h-11 w-full rounded-xl border border-border bg-card/80 pl-10 pr-3 text-sm text-foreground outline-none backdrop-blur-sm transition focus:border-turquoise-400 focus:ring-4 focus:ring-turquoise-500/15"
        />
      </div>

      {hasQuery && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center rounded-xl border border-border bg-card/70 py-6 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando en CIE-10...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Mostrando <span className="font-semibold text-foreground">{results.length}</span> de{" "}
                <span className="font-semibold text-foreground">{total}</span> resultados
              </p>

              {results.length === 0 ? (
                <div className="rounded-xl border border-border bg-card/70 px-4 py-6 text-center text-sm text-muted-foreground">
                  Sin resultados globales para "{query.trim()}".
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((item) => (
                    <div
                      key={`${item.code}-${item.description}`}
                      className="rounded-xl border border-border bg-card/80 p-3 transition hover:border-turquoise-400/60"
                    >
                      <p className="font-mono text-xs tracking-wider text-turquoise-400">{item.code}</p>
                      <p className="mt-1 text-sm text-foreground">{item.description}</p>

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
                          aria-label="Copiar solo código"
                          onClick={() => onCopyCodeOnly(item)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-turquoise-300 hover:text-foreground"
                        >
                          <Scissors className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {canLoadMore && (
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="w-full rounded-lg border border-border bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition hover:border-turquoise-300 hover:text-turquoise-400"
                >
                  Ver más resultados
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
