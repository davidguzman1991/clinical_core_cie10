"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildClinicalApiUrl,
  fetchJson,
  getClinicalApiBase,
  isNetworkLikeError,
  toUserFacingApiError,
} from "../lib/api";

export type ICD10SearchResult = {
  code: string;
  description: string;
};

type UseICDSearchState = {
  results: ICD10SearchResult[];
  loading: boolean;
  error: string | null;
};

function normalizeICDResult(item: unknown): ICD10SearchResult | null {
  if (!item || typeof item !== "object") return null;
  const obj = item as Record<string, unknown>;

  const code =
    (typeof obj.code === "string" && obj.code) ||
    (typeof obj.icd === "string" && obj.icd) ||
    (typeof obj.icd10 === "string" && obj.icd10) ||
    (typeof obj.icd_code === "string" && obj.icd_code) ||
    "";

  const description =
    (typeof obj.description === "string" && obj.description) ||
    (typeof obj.desc === "string" && obj.desc) ||
    (typeof obj.term === "string" && obj.term) ||
    "";

  if (!code || !description) return null;
  return { code, description };
}

export function useICDSearch(query: string, options?: { limit?: number }) {
  const limit = options?.limit ?? 20;

  const abortRef = useRef<AbortController | null>(null);
  const [state, setState] = useState<UseICDSearchState>({
    results: [],
    loading: false,
    error: null,
  });

  const apiBase = getClinicalApiBase();
  const trimmed = useMemo(() => query.trim(), [query]);
  const shouldSearch = trimmed.length > 0;

  useEffect(() => {
    if (!shouldSearch) {
      abortRef.current?.abort();
      abortRef.current = null;
      setState({ results: [], loading: false, error: null });
      return;
    }

    if (!apiBase) {
      setState({
        results: [],
        loading: false,
        error:
          "Falta configurar NEXT_PUBLIC_API_URL. Asegúrate de tener .env.local (con punto) en el root y reinicia el dev server.",
      });
      return;
    }

    const handle = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        const directUrl = buildClinicalApiUrl("clinical/icd10/search", { q: trimmed });
        if (!directUrl) {
          throw new Error("Clinical API base URL is not configured.");
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

          const proxyUrl = `/api/clinical/icd10/search?q=${encodeURIComponent(trimmed)}`;
          json = await fetchJson<unknown>(proxyUrl, {
            signal: controller.signal,
            timeoutMs: 9000,
            retries: 2,
          });
        }

        const arr = Array.isArray(json) ? json : [];

        const normalized = arr
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
    }, 400);

    return () => {
      window.clearTimeout(handle);
    };
  }, [apiBase, limit, shouldSearch, trimmed]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return state;
}
