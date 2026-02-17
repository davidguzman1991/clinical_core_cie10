"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import ICDResultCard from "../components/clinical/ICDResultCard";
import SearchInput from "../components/clinical/SearchInput";
import Skeleton from "../components/clinical/Skeleton";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/use-toast";
import { useICDSearch } from "../hooks/useICDSearch";
import { getClinicalApiBase } from "../lib/api";

const FAVORITES_STORAGE_KEY = "clinical-core.favorite-icd10";
const RECENT_SEARCHES_STORAGE_KEY = "clinical-core.recent-searches";
const MAX_RECENT_SEARCHES = 8;

function trimText(value: string, maxLength = 115) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { toast } = useToast();
  const { results, loading, error } = useICDSearch(query, { limit: 20 });
  const trimmedQuery = query.trim();
  const noResultsToastQueryRef = useRef<string | null>(null);
  const errorToastRef = useRef<string | null>(null);

  const subtitle = useMemo(() => {
    const base = getClinicalApiBase();
    if (!base) return "Configura NEXT_PUBLIC_API_URL para habilitar búsquedas.";
    return "Busca diagnósticos ICD-10 rápido, desde el celular.";
  }, []);

  useEffect(() => {
    try {
      const savedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites) as unknown;
        if (Array.isArray(parsed)) {
          setFavoriteCodes(parsed.filter((item): item is string => typeof item === "string"));
        }
      }

      const savedRecents = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (savedRecents) {
        const parsed = JSON.parse(savedRecents) as unknown;
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.filter((item): item is string => typeof item === "string"));
        }
      }
    } catch {
      setFavoriteCodes([]);
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteCodes));
  }, [favoriteCodes]);

  useEffect(() => {
    window.localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    if (!copiedCode) return;

    const handle = window.setTimeout(() => {
      setCopiedCode(null);
    }, 1400);

    return () => window.clearTimeout(handle);
  }, [copiedCode]);

  useEffect(() => {
    if (trimmedQuery.length === 0) {
      noResultsToastQueryRef.current = null;
      return;
    }

    if (loading || error || results.length > 0) return;
    if (noResultsToastQueryRef.current === trimmedQuery) return;

    noResultsToastQueryRef.current = trimmedQuery;
    toast({
      title: "Sin resultados",
      description: `No encontramos CIE-10 para "${trimmedQuery}".`,
    });
  }, [error, loading, results.length, toast, trimmedQuery]);

  useEffect(() => {
    if (!error) {
      errorToastRef.current = null;
      return;
    }

    if (errorToastRef.current === error) return;
    errorToastRef.current = error;

    toast({
      title: "Error backend",
      description: error,
      variant: "destructive",
      duration: 4200,
    });
  }, [error, toast]);

  const pushRecentSearch = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;

    setRecentSearches((prev) => {
      const deduped = [cleaned, ...prev.filter((item) => item.toLowerCase() !== cleaned.toLowerCase())];
      return deduped.slice(0, MAX_RECENT_SEARCHES);
    });
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Código copiado",
        description: "El CIE-10 fue copiado al portapapeles.",
      });
    } catch {
      toast({
        title: "No se pudo copiar",
        description: "Intenta copiar manualmente el código CIE-10.",
        variant: "destructive",
      });
    }
  };

  const handleSelect = (code: string) => {
    setSelectedCode(code);
    pushRecentSearch(trimmedQuery);
    toast({
      title: "ICD10 seleccionado",
      description: `Seleccionaste ${code}.`,
    });
  };

  const handleToggleFavorite = (code: string) => {
    setFavoriteCodes((prev) => {
      const isFavorite = prev.includes(code);
      if (isFavorite) {
        toast({ title: "Favorito eliminado", description: `${code} removido de favoritos.` });
        return prev.filter((item) => item !== code);
      }

      toast({ title: "Favorito guardado", description: `${code} agregado a favoritos.` });
      return [code, ...prev];
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#eff6ff_0%,#dff8f5_34%,#d9e5ff_64%,#edf1ff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(45,212,191,0.18),transparent_34%),radial-gradient(circle_at_86%_7%,rgba(59,130,246,0.22),transparent_28%)]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <header className="mb-5 rounded-3xl border border-white/45 bg-white/65 p-5 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.5)] backdrop-blur-md">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Clinical Core</h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </header>

        <div className="sticky top-0 z-20 -mx-4 rounded-2xl border-y border-white/45 bg-white/65 px-4 pb-3 pt-3 shadow-sm backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <SearchInput
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
            loading={loading}
            placeholder="Buscar diagnóstico, ejemplo: diabetes, infección, hipertensión"
          />
          <p className="mt-2 text-xs text-slate-500">
            Debounce 400ms. Requests anteriores se cancelan. Máximo 20 resultados.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            API: <span className="font-medium">{getClinicalApiBase() ?? "undefined"}</span>
          </p>

          {recentSearches.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700">Recent</span>
              {recentSearches.map((item) => (
                <Button
                  key={item}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(item)}
                  className="h-7 rounded-full px-3"
                >
                  {item}
                </Button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-800 shadow-sm">
            {error}
          </div>
        )}

        <main className="mt-5">
          {loading && <Skeleton lines={6} />}

          {!loading && trimmedQuery.length > 0 && !error && results.length === 0 && (
            <div className="rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur-sm">
              Sin resultados.
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((item) => (
                <ICDResultCard
                  key={`${item.code}-${item.description}`}
                  code={item.code}
                  diagnosisName={item.description}
                  shortDescription={trimText(item.description)}
                  copied={copiedCode === item.code}
                  isSelected={selectedCode === item.code}
                  isFavorite={favoriteCodes.includes(item.code)}
                  onCopy={handleCopy}
                  onSelect={handleSelect}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}

          {!loading && trimmedQuery.length === 0 && (
            <div className="rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur-sm">
              Empieza escribiendo para buscar en ICD-10.
            </div>
          )}

          {!loading && favoriteCodes.length > 0 && (
            <section className="mt-6 rounded-2xl border border-white/45 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-800">
                Favorites
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {favoriteCodes.map((code) => (
                  <Button
                    key={code}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelect(code)}
                    className="rounded-full"
                  >
                    {code}
                  </Button>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
