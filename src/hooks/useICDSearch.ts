"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildUrl,
  fetchJson,
  isNetworkLikeError,
  toUserFacingApiError,
} from "../lib/api";

export type ICD10SearchResult = {
  code?: string;
  compact_code?: string;
  label?: string;
  description: string;
};

type UseICDSearchState = {
  results: ICD10SearchResult[];
  loading: boolean;
  error: string | null;
};

function extractICDItems(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.results)) return record.results;
    return [record];
  }

  return [];
}

function normalizeICDResult(item: unknown): ICD10SearchResult | null {
  if (!item || typeof item !== "object") return null;
  const obj = item as Record<string, unknown>;

  const code =
    (typeof obj.code === "string" && obj.code) ||
    (typeof obj.compact_code === "string" && obj.compact_code) ||
    (typeof obj.icd === "string" && obj.icd) ||
    (typeof obj.icd10 === "string" && obj.icd10) ||
    (typeof obj.icd_code === "string" && obj.icd_code) ||
    "";

  const compactCode =
    (typeof obj.compact_code === "string" && obj.compact_code) ||
    (typeof obj.icd_compact === "string" && obj.icd_compact) ||
    "";

  const label =
    (typeof obj.label === "string" && obj.label) ||
    (typeof obj.title === "string" && obj.title) ||
    "";

  const description =
    (typeof obj.description === "string" && obj.description) ||
    (typeof obj.desc === "string" && obj.desc) ||
    (typeof obj.term === "string" && obj.term) ||
    (typeof obj.label === "string" && obj.label) ||
    (typeof obj.explanation === "string" && obj.explanation) ||
    "";

  if (!code && !compactCode && !label && !description) return null;

  return {
    code: code || undefined,
    compact_code: compactCode || undefined,
    label: label || undefined,
    description: description || label || code || compactCode || "—",
  };
}

export function useICDSearch(
  query: string,
  options?: { limit?: number; debounceMs?: number }
) {
  const limit = options?.limit ?? 20;
  const debounceMs = options?.debounceMs ?? 400;

  const abortRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<UseICDSearchState>({
    results: [],
    loading: false,
    error: null,
  });

  const trimmed = useMemo(() => query.trim(), [query]);
  const shouldSearch = trimmed.length > 0;

  useEffect(() => {
    if (!shouldSearch) {
      abortRef.current?.abort();
      abortRef.current = null;
      setState({ results: [], loading: false, error: null });
      return;
    }

    const handle = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        const directUrl = buildUrl("/clinical/icd10/search", { q: trimmed });
        if (!directUrl) {
          throw new Error(
            "Falta configurar NEXT_PUBLIC_API_BASE_URL o NEXT_PUBLIC_API_URL. Asegúrate de tener .env.local (con punto) en el root y reinicia el dev server."
          );
        }

        let json: unknown;
        try {
          json = await fetchJson<unknown>(directUrl, {
            signal: controller.signal,
            timeoutMs: 7000,
            retries: 2,
          });
        } catch (error) {
          if (!isNetworkLikeError(error)) {
            throw error;
          }

          const proxyUrl = `/api/icd10/search?${new URLSearchParams({ q: trimmed }).toString()}`;
          json = await fetchJson<unknown>(proxyUrl, {
            signal: controller.signal,
            timeoutMs: 9000,
            retries: 2,
          });
        }

        if (process.env.NODE_ENV !== "production") {
          console.debug("icd10 search response shape", json);
        }

        const items = extractICDItems(json);

        const normalized = items
          .map(normalizeICDResult)
          .filter((x): x is ICD10SearchResult => Boolean(x))
          .slice(0, limit);

        setState({ results: normalized, loading: false, error: null });
      } catch (e) {
        if ((e as { name?: string }).name === "AbortError") return;
        setState({
          results: [],
          loading: false,
          error: toUserFacingApiError(e),
        });
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(handle);
    };
  }, [debounceMs, limit, shouldSearch, trimmed]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return state;
}
