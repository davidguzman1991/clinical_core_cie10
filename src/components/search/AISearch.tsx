"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Clock, Search as SearchIcon, Sparkles, Star } from "lucide-react";

import AIStatusCard from "@/components/clinical/AIStatusCard";
import EvidenceCards from "@/components/clinical/EvidenceCards";
import ICDResultCard from "@/components/clinical/ICDResultCard";
import QuickExamples from "@/components/clinical/QuickExamples";
import SearchInput from "@/components/clinical/SearchInput";
import Skeleton from "@/components/clinical/Skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useICDSearch } from "@/hooks/useICDSearch";

const FAVORITES_STORAGE_KEY = "clinical-core.favorite-icd10";
const RECENT_SEARCHES_STORAGE_KEY = "clinical-core.recent-searches";
const MAX_RECENT_SEARCHES = 8;

function trimText(value: string, maxLength = 115) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

export default function AISearch() {
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
    const handle = window.setTimeout(() => setCopiedCode(null), 1400);
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

  // Main action: copy full clinical text for notes/prescriptions.
  const handleCopy = async (code: string, diagnosisName: string) => {
    try {
      await navigator.clipboard.writeText(`${code} - ${diagnosisName}`);
      setCopiedCode(code);
      toast({
        title: "Copiado al portapapeles",
        description: `${code} - ${diagnosisName}`,
      });
    } catch {
      toast({
        title: "No se pudo copiar",
        description: "Intenta copiar manualmente el contenido.",
        variant: "destructive",
      });
    }
  };

  const handleCopyCodeOnly = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Copiado al portapapeles",
        description: code,
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

  const hasResults = results.length > 0;
  const showEmptyState = !loading && trimmedQuery.length === 0 && !hasResults;
  const showNoResults = !loading && trimmedQuery.length > 0 && !error && !hasResults;

  return (
    <>
      <div className="mt-2 px-1">
        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={() => setQuery("")}
          loading={loading}
          placeholder="Escribe diagnóstico, síntoma o palabra clave…"
        />
      </div>

      <AIStatusCard />

      <AnimatePresence>
        {recentSearches.length > 0 && !hasResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-auto mt-4 w-full max-w-2xl overflow-hidden"
          >
            <div className="mb-2.5 flex items-center gap-2 px-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Búsquedas recientes
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item) => (
                <Button
                  key={item}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(item)}
                  className="rounded-full"
                >
                  <SearchIcon className="mr-1 h-3 w-3 opacity-50" />
                  {item}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-4 w-full max-w-2xl rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 dark:border-red-800/40 dark:bg-red-950/50"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto mt-5 w-full max-w-2xl">
        {loading && <Skeleton lines={4} />}

        <AnimatePresence mode="wait">
          {!loading && hasResults && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-3 flex items-center gap-2 px-1">
                <Sparkles className="h-3.5 w-3.5 text-turquoise-500" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {results.length} resultado{results.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {results.map((item, idx) => {
                  const displayCode = item.code ?? item.compact_code ?? item.label ?? "—";

                  return (
                    <ICDResultCard
                      key={`${displayCode}-${item.description}-${idx}`}
                      code={displayCode}
                      diagnosisName={item.description}
                      shortDescription={trimText(item.description)}
                      copied={copiedCode === displayCode}
                      isSelected={selectedCode === displayCode}
                      isFavorite={favoriteCodes.includes(displayCode)}
                      onCopy={handleCopy}
                      onCopyCodeOnly={handleCopyCodeOnly}
                      onSelect={handleSelect}
                      onToggleFavorite={handleToggleFavorite}
                      index={idx}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showNoResults && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-10 text-center"
            >
              <SearchIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">Sin resultados</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No encontramos CIE-10 para &quot;{trimmedQuery}&quot;. Intenta con otro término.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!loading && favoriteCodes.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <div className="mb-3 flex items-center gap-2 px-1">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Favoritos
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {favoriteCodes.map((code) => (
                  <Button
                    key={code}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelect(code)}
                    className="rounded-full"
                  >
                    <Star className="mr-1 h-3 w-3 fill-amber-400 text-amber-400" />
                    {code}
                  </Button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {showEmptyState && (
        <>
          <QuickExamples onSelect={setQuery} />
          <EvidenceCards />
        </>
      )}
    </>
  );
}
