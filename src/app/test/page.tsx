"use client";

import { useEffect, useState } from "react";

import { apiFetch, getClinicalApiBase } from "@/lib/api";

export default function TestPage() {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const base = getClinicalApiBase();

    if (!base) {
      setError("Configura NEXT_PUBLIC_API_URL (o NEXT_PUBLIC_API_BASE_URL).");
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const payload = await apiFetch("/health", { cache: "no-store" });
        if (cancelled) return;
        setData(payload);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "No se pudo cargar /health.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
