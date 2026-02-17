"use client";

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  buildClinicalApiUrl,
  fetchJson,
  isNetworkLikeError,
  toUserFacingApiError,
} from "@/lib/api";
import { cn } from "@/lib/utils";

export type ICD10Option = {
  code: string;
  description: string;
};

type ClinicalAutocompleteProps = {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  minQueryLength?: number;
  debounceMs?: number;
  maxResults?: number;
  initialValue?: string;
  onSelect?: (item: ICD10Option) => void;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeICD10Item(item: unknown): ICD10Option | null {
  if (!item || typeof item !== "object") return null;

  const obj = item as Record<string, unknown>;
  const code =
    (typeof obj.code === "string" && obj.code.trim()) ||
    (typeof obj.icd === "string" && obj.icd.trim()) ||
    (typeof obj.icd10 === "string" && obj.icd10.trim()) ||
    (typeof obj.icd_code === "string" && obj.icd_code.trim()) ||
    "";

  const description =
    (typeof obj.description === "string" && obj.description.trim()) ||
    (typeof obj.desc === "string" && obj.desc.trim()) ||
    (typeof obj.term === "string" && obj.term.trim()) ||
    "";

  if (!code || !description) return null;
  return { code, description };
}

function getSearchArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.results)) return record.results;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.data)) return record.data;
  }

  return [];
}

function highlightText(text: string, query: string) {
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (!tokens.length) return text;

  const re = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "ig");
  const parts = text.split(re);

  return parts.map((part, idx) => {
    if (!part) return null;

    const isMatch = tokens.some((token) => part.toLowerCase() === token.toLowerCase());
    if (!isMatch) return <span key={`${part}-${idx}`}>{part}</span>;

    return (
      <mark
        key={`${part}-${idx}`}
        className="rounded-sm bg-cyan-100 px-0.5 text-cyan-900"
      >
        {part}
      </mark>
    );
  });
}

type OptionItemProps = {
  id: string;
  item: ICD10Option;
  query: string;
  isActive: boolean;
  onHover: () => void;
  onSelect: () => void;
};

const OptionItem = memo(function OptionItem({
  id,
  item,
  query,
  isActive,
  onHover,
  onSelect,
}: OptionItemProps) {
  return (
    <button
      id={id}
      type="button"
      role="option"
      aria-selected={isActive}
      onMouseEnter={onHover}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className={cn(
        "w-full border-b border-zinc-100 px-4 py-3.5 text-left transition",
        "focus:outline-none focus-visible:bg-cyan-50",
        isActive ? "bg-cyan-50/90" : "bg-white hover:bg-zinc-50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold tracking-wide text-zinc-700">
          {highlightText(item.code, query)}
        </p>
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-zinc-700">
          {highlightText(item.description, query)}
        </p>
      </div>
    </button>
  );
});

async function queryICD10(q: string, signal: AbortSignal): Promise<ICD10Option[]> {
  const directUrl = buildClinicalApiUrl("icd10/search", { q });

  try {
    if (directUrl) {
      const directPayload = await fetchJson<unknown>(directUrl, {
        signal,
        cache: "no-store",
        timeoutMs: 8000,
        retries: 1,
      });

      return getSearchArray(directPayload)
        .map(normalizeICD10Item)
        .filter((item): item is ICD10Option => Boolean(item));
    }
  } catch (error) {
    if (!isNetworkLikeError(error)) {
      throw error;
    }
  }

  const proxyPayload = await fetchJson<unknown>(
    `/api/icd10/search?q=${encodeURIComponent(q)}`,
    {
      signal,
      cache: "no-store",
      timeoutMs: 9000,
      retries: 1,
    }
  );

  return getSearchArray(proxyPayload)
    .map(normalizeICD10Item)
    .filter((item): item is ICD10Option => Boolean(item));
}

export default function ClinicalAutocomplete({
  className,
  inputClassName,
  placeholder = "Search ICD-10 code or diagnosis...",
  minQueryLength = 2,
  debounceMs = 350,
  maxResults = 12,
  initialValue = "",
  onSelect,
}: ClinicalAutocompleteProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const skipNextSearchRef = useRef(false);

  const [query, setQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue.trim());
  const [results, setResults] = useState<ICD10Option[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ICD10Option | null>(null);
  const [copied, setCopied] = useState(false);

  const listboxId = useId();

  const trimmedQuery = useMemo(() => query.trim(), [query]);
  const canSearch = trimmedQuery.length >= minQueryLength;
  const debouncedCanSearch = debouncedQuery.length >= minQueryLength;

  const activeOptionId =
    open && activeIndex >= 0 && activeIndex < results.length
      ? `${listboxId}-opt-${activeIndex}`
      : undefined;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(trimmedQuery);
    }, debounceMs);

    return () => window.clearTimeout(handle);
  }, [debounceMs, trimmedQuery]);

  useEffect(() => {
    if (!debouncedCanSearch) {
      abortRef.current?.abort();
      abortRef.current = null;
      setLoading(false);
      setError(null);
      setResults([]);
      setActiveIndex(-1);
      setOpen(false);
      return;
    }

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const rows = await queryICD10(debouncedQuery, controller.signal);
        if (cancelled) return;

        const sliced = rows.slice(0, maxResults);
        setResults(sliced);
        setActiveIndex(sliced.length > 0 ? 0 : -1);
        setOpen(true);
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") return;
        if (cancelled) return;

        setResults([]);
        setActiveIndex(-1);
        setOpen(true);
        setError(toUserFacingApiError(error));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedCanSearch, debouncedQuery, maxResults]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current) return;

      const target = event.target as Node | null;
      if (target && !rootRef.current.contains(target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const selectItem = useCallback(
    (item: ICD10Option) => {
      skipNextSearchRef.current = true;
      setSelected(item);
      setQuery(item.description);
      setOpen(false);
      setCopied(false);
      setActiveIndex(-1);
      onSelect?.(item);
    },
    [onSelect]
  );

  const handleCopy = useCallback(async () => {
    if (!selected) return;

    try {
      await navigator.clipboard.writeText(selected.code);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 1300);
    } catch {
      setCopied(false);
    }
  }, [selected]);

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();

        if (!open) {
          if (canSearch) setOpen(true);
          return;
        }

        setActiveIndex((current) => {
          if (results.length === 0) return -1;
          return current < results.length - 1 ? current + 1 : 0;
        });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        if (!open) {
          if (canSearch) setOpen(true);
          return;
        }

        setActiveIndex((current) => {
          if (results.length === 0) return -1;
          return current > 0 ? current - 1 : results.length - 1;
        });
        return;
      }

      if (event.key === "Enter") {
        if (open && activeIndex >= 0 && activeIndex < results.length) {
          event.preventDefault();
          selectItem(results[activeIndex]);
        }
        return;
      }

      if (event.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
      }
    },
    [activeIndex, canSearch, open, results, selectItem]
  );

  const showDropdown = open && canSearch;

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <div className="sticky top-0 z-20 bg-white/95 pb-2 backdrop-blur">
        <label htmlFor={`${listboxId}-input`} className="sr-only">
          ICD-10 search
        </label>

        <div className="relative">
          <input
            id={`${listboxId}-input`}
            ref={inputRef}
            type="search"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={query}
            placeholder={placeholder}
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-expanded={showDropdown}
            aria-activedescendant={activeOptionId}
            aria-busy={loading}
            onFocus={() => {
              if (canSearch) setOpen(true);
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setError(null);
              setCopied(false);
              if (event.target.value.trim().length >= minQueryLength) {
                setOpen(true);
              } else {
                setOpen(false);
                setResults([]);
                setActiveIndex(-1);
              }
            }}
            onKeyDown={handleInputKeyDown}
            className={cn(
              "h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 pr-11 text-base text-zinc-900 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100",
              inputClassName
            )}
          />

          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            {loading ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-cyan-600"
                aria-hidden="true"
              />
            ) : (
              <span className="text-xs text-zinc-400">ICD</span>
            )}
          </div>
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {loading && "Loading ICD-10 results"}
        {!loading && !error && canSearch && results.length === 0 && "No ICD-10 results"}
        {error ? `Search error: ${error}` : ""}
      </div>

      <div
        className={cn(
          "absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg",
          "origin-top transition duration-150",
          showDropdown
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        {showDropdown && (
          <div id={listboxId} role="listbox" className="max-h-80 overflow-y-auto overscroll-contain">
            {loading && (
              <div className="space-y-2 p-3" aria-label="Loading results">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="animate-pulse rounded-lg border border-zinc-100 bg-zinc-50 p-3"
                  >
                    <div className="mb-2 h-3 w-20 rounded bg-zinc-200" />
                    <div className="h-3 w-11/12 rounded bg-zinc-200" />
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="p-4 text-sm text-red-700">{error}</div>
            )}

            {!loading && !error && results.length === 0 && (
              <div className="p-4 text-sm text-zinc-600">
                No clinical matches found for "{trimmedQuery}". Try symptoms, condition names,
                or an ICD code.
              </div>
            )}

            {!loading && !error && results.length > 0 && (
              <div>
                {results.map((item, index) => (
                  <OptionItem
                    key={`${item.code}-${item.description}`}
                    id={`${listboxId}-opt-${index}`}
                    item={item}
                    query={trimmedQuery}
                    isActive={activeIndex === index}
                    onHover={() => setActiveIndex(index)}
                    onSelect={() => selectItem(item)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <article
          className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
          aria-label="Selected ICD-10 code"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-zinc-500">ICD-10 code</p>
              <p className="mt-1 inline-flex rounded-md bg-cyan-50 px-2 py-1 text-sm font-semibold tracking-wide text-cyan-900">
                {selected.code}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">{selected.description}</p>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="h-11 shrink-0 rounded-lg border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.99]"
              aria-live="polite"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </article>
      )}
    </div>
  );
}
