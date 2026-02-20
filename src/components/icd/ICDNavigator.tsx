"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { buildUrl, fetchJson, isNetworkLikeError, toUserFacingApiError } from "@/lib/api";

import ICDChapterGrid, { type ICDChapter, type ICDSubcategory } from "./ICDChapterGrid";
import ICDCodeList from "./ICDCodeList";
import ICDManualSearch, { type ManualICDResult } from "./ICDManualSearch";
import ICDSubcategoryList from "./ICDSubcategoryList";

const MANUAL_DEFAULT_LIMIT = 20;
const MANUAL_LIMIT_STEP = 20;
const CODE_QUERY_PATTERN = /^[A-Z]\d{1,2}(?:\.\d{0,4})?$/i;

type ManualSearchResponse = {
  results?: unknown[];
  total?: number;
  count?: number;
};

function extractICDItems(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.results)) return record.results;
    if (Array.isArray(record.items)) return record.items;
    return [record];
  }

  return [];
}

function normalizeICDResult(item: unknown): ManualICDResult | null {
  if (!item || typeof item !== "object") return null;
  const obj = item as Record<string, unknown>;

  const code =
    (typeof obj.code === "string" && obj.code) ||
    (typeof obj.compact_code === "string" && obj.compact_code) ||
    (typeof obj.icd === "string" && obj.icd) ||
    (typeof obj.icd10 === "string" && obj.icd10) ||
    (typeof obj.icd_code === "string" && obj.icd_code) ||
    "";

  const description =
    (typeof obj.description === "string" && obj.description) ||
    (typeof obj.desc === "string" && obj.desc) ||
    (typeof obj.term === "string" && obj.term) ||
    (typeof obj.label === "string" && obj.label) ||
    "";

  if (!code && !description) return null;

  return {
    code: code || "—",
    description: description || code || "—",
  };
}

function extractTotal(data: unknown, fallback: number) {
  if (!data || typeof data !== "object") return fallback;
  const record = data as Record<string, unknown>;

  const total =
    (typeof record.total === "number" && record.total) ||
    (typeof record.count === "number" && record.count) ||
    (typeof record.total_results === "number" && record.total_results) ||
    0;

  return total > 0 ? total : fallback;
}

const ICD_CHAPTERS_MVP: ICDChapter[] = [
  {
    range: "A00-B99",
    title: "Infecciosas",
    subcategories: [
      {
        code: "A09",
        description: "Gastroenteritis y colitis de origen infeccioso",
        codes: [
          { code: "A09.0", description: "Gastroenteritis infecciosa no especificada" },
          { code: "A09.9", description: "Diarrea y gastroenteritis de presunto origen infeccioso" },
        ],
      },
      {
        code: "B20",
        description: "Enfermedad por VIH",
        codes: [
          { code: "B20.0", description: "Enfermedad por VIH con infección oportunista" },
          { code: "B20.9", description: "Enfermedad por VIH sin otra especificación" },
        ],
      },
    ],
  },
  {
    range: "C00-D48",
    title: "Neoplasias",
    subcategories: [
      {
        code: "C34",
        description: "Neoplasia maligna de bronquios y pulmón",
        codes: [
          { code: "C34.1", description: "Lóbulo superior, bronquio o pulmón" },
          { code: "C34.9", description: "Bronquio o pulmón, parte no especificada" },
        ],
      },
      {
        code: "D12",
        description: "Neoplasia benigna de colon, recto y ano",
        codes: [
          { code: "D12.6", description: "Neoplasia benigna de colon, no especificada" },
          { code: "D12.8", description: "Neoplasia benigna de recto" },
        ],
      },
    ],
  },
  {
    range: "E00-E90",
    title: "Endocrinas",
    subcategories: [
      {
        code: "E10",
        description: "Diabetes mellitus tipo 1",
        codes: [
          { code: "E10.9", description: "Diabetes mellitus tipo 1 sin complicaciones" },
          { code: "E10.65", description: "Diabetes mellitus tipo 1 con hiperglucemia" },
        ],
      },
      {
        code: "E11",
        description: "Diabetes mellitus tipo 2",
        codes: [
          { code: "E11.7", description: "Diabetes mellitus tipo 2 con complicaciones" },
          { code: "E11.9", description: "Diabetes mellitus tipo 2 sin complicaciones" },
        ],
      },
      {
        code: "E66",
        description: "Obesidad",
        codes: [
          { code: "E66.0", description: "Obesidad debida a exceso de calorías" },
          { code: "E66.9", description: "Obesidad no especificada" },
        ],
      },
      {
        code: "E78",
        description: "Trastornos del metabolismo de las lipoproteínas",
        codes: [
          { code: "E78.0", description: "Hipercolesterolemia pura" },
          { code: "E78.5", description: "Hiperlipidemia no especificada" },
        ],
      },
    ],
  },
  {
    range: "I00-I99",
    title: "Cardiovasculares",
    subcategories: [
      {
        code: "I10",
        description: "Hipertensión esencial",
        codes: [
          { code: "I10.0", description: "Hipertensión esencial no complicada" },
          { code: "I10.9", description: "Hipertensión esencial, no especificada" },
        ],
      },
      {
        code: "I25",
        description: "Cardiopatía isquémica crónica",
        codes: [
          { code: "I25.1", description: "Aterosclerosis coronaria" },
          { code: "I25.9", description: "Cardiopatía isquémica crónica no especificada" },
        ],
      },
    ],
  },
  {
    range: "J00-J99",
    title: "Respiratorias",
    subcategories: [
      {
        code: "J18",
        description: "Neumonía",
        codes: [
          { code: "J18.0", description: "Bronconeumonía no especificada" },
          { code: "J18.9", description: "Neumonía no especificada" },
        ],
      },
      {
        code: "J45",
        description: "Asma",
        codes: [
          { code: "J45.9", description: "Asma no especificada" },
          { code: "J45.5", description: "Asma grave persistente" },
        ],
      },
    ],
  },
  {
    range: "K00-K93",
    title: "Digestivas",
    subcategories: [
      {
        code: "K29",
        description: "Gastritis y duodenitis",
        codes: [
          { code: "K29.7", description: "Gastritis, no especificada" },
          { code: "K29.9", description: "Gastroduodenitis, no especificada" },
        ],
      },
      {
        code: "K76",
        description: "Otras enfermedades del hígado",
        codes: [
          { code: "K76.0", description: "Hígado graso, no clasificado en otra parte" },
          { code: "K76.9", description: "Enfermedad del hígado no especificada" },
        ],
      },
    ],
  },
  {
    range: "N00-N99",
    title: "Genitourinarias",
    subcategories: [
      {
        code: "N18",
        description: "Enfermedad renal crónica",
        codes: [
          { code: "N18.3", description: "Enfermedad renal crónica, estadio 3" },
          { code: "N18.9", description: "Enfermedad renal crónica, no especificada" },
        ],
      },
      {
        code: "N39",
        description: "Otros trastornos urinarios",
        codes: [
          { code: "N39.0", description: "Infección urinaria, sitio no especificado" },
          { code: "N39.9", description: "Trastorno urinario no especificado" },
        ],
      },
    ],
  },
  {
    range: "R00-R99",
    title: "Síntomas y signos",
    subcategories: [
      {
        code: "R05",
        description: "Tos",
        codes: [
          { code: "R05.0", description: "Tos aguda" },
          { code: "R05.9", description: "Tos no especificada" },
        ],
      },
      {
        code: "R50",
        description: "Fiebre de origen desconocido",
        codes: [
          { code: "R50.8", description: "Otras fiebres especificadas" },
          { code: "R50.9", description: "Fiebre no especificada" },
        ],
      },
    ],
  },
  {
    range: "S00-T98",
    title: "Traumatismos",
    subcategories: [
      {
        code: "S06",
        description: "Lesión intracraneal",
        codes: [
          { code: "S06.0", description: "Conmoción cerebral" },
          { code: "S06.9", description: "Lesión intracraneal no especificada" },
        ],
      },
      {
        code: "T14",
        description: "Traumatismo de región no especificada",
        codes: [
          { code: "T14.1", description: "Herida abierta de región no especificada" },
          { code: "T14.9", description: "Traumatismo no especificado" },
        ],
      },
    ],
  },
  {
    range: "Z00-Z99",
    title: "Factores",
    subcategories: [
      {
        code: "Z00",
        description: "Examen general",
        codes: [
          { code: "Z00.0", description: "Examen general de salud" },
          { code: "Z00.8", description: "Otros exámenes generales" },
        ],
      },
      {
        code: "Z79",
        description: "Uso prolongado de medicamentos",
        codes: [
          { code: "Z79.4", description: "Uso prolongado de insulina" },
          { code: "Z79.899", description: "Uso prolongado de otros medicamentos" },
        ],
      },
    ],
  },
];

export default function ICDNavigator() {
  const { toast } = useToast();
  const manualAbortRef = useRef<AbortController | null>(null);

  const [selectedChapter, setSelectedChapter] = useState<ICDChapter | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ICDSubcategory | null>(null);
  const [subcategoryQuery, setSubcategoryQuery] = useState("");
  const [manualQuery, setManualQuery] = useState("");
  const [manualResults, setManualResults] = useState<ManualICDResult[]>([]);
  const [manualLimit, setManualLimit] = useState(MANUAL_DEFAULT_LIMIT);
  const [manualTotal, setManualTotal] = useState(0);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [debouncedManualQuery, setDebouncedManualQuery] = useState("");

  const hasManualQuery = manualQuery.trim().length > 0;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedManualQuery(manualQuery.trim());
    }, 300);

    return () => window.clearTimeout(handle);
  }, [manualQuery]);

  useEffect(() => {
    setManualLimit(MANUAL_DEFAULT_LIMIT);
  }, [debouncedManualQuery]);

  useEffect(() => {
    const searchText = debouncedManualQuery.trim();

    if (!searchText) {
      manualAbortRef.current?.abort();
      manualAbortRef.current = null;
      setManualResults([]);
      setManualTotal(0);
      setManualLoading(false);
      setManualError(null);
      return;
    }

    const controller = new AbortController();
    manualAbortRef.current?.abort();
    manualAbortRef.current = controller;

    const isCodeLike = CODE_QUERY_PATTERN.test(searchText.replace(/\s+/g, ""));

    const requestParams = isCodeLike
      ? { code: searchText.replace(/\s+/g, ""), limit: manualLimit }
      : { description_normalized: searchText, limit: manualLimit };

    const run = async () => {
      setManualLoading(true);
      setManualError(null);

      try {
        const primaryUrl = buildUrl("/clinical/icd10/search", requestParams);
        if (!primaryUrl) {
          throw new Error(
            "Falta configurar NEXT_PUBLIC_API_BASE_URL o NEXT_PUBLIC_API_URL para usar búsqueda manual."
          );
        }

        let json: unknown;

        try {
          json = await fetchJson<ManualSearchResponse>(primaryUrl, {
            signal: controller.signal,
            timeoutMs: 7000,
            retries: 1,
          });
        } catch (error) {
          if (!isNetworkLikeError(error)) {
            throw error;
          }

          const proxyQuery = new URLSearchParams(
            Object.entries(requestParams).map(([key, value]) => [key, String(value)])
          );

          json = await fetchJson<ManualSearchResponse>(`/api/icd10/search?${proxyQuery.toString()}`, {
            signal: controller.signal,
            timeoutMs: 9000,
            retries: 1,
          });
        }

        let normalized = extractICDItems(json)
          .map(normalizeICDResult)
          .filter((item): item is ManualICDResult => Boolean(item));

        if (normalized.length === 0) {
          const fallbackParams = { q: searchText, limit: manualLimit };
          const fallbackUrl = buildUrl("/clinical/icd10/search", fallbackParams);

          if (fallbackUrl) {
            const fallbackJson = await fetchJson<ManualSearchResponse>(fallbackUrl, {
              signal: controller.signal,
              timeoutMs: 7000,
              retries: 1,
            });

            normalized = extractICDItems(fallbackJson)
              .map(normalizeICDResult)
              .filter((item): item is ManualICDResult => Boolean(item));

            json = fallbackJson;
          }
        }

        const total = extractTotal(json, normalized.length);

        setManualResults(normalized.slice(0, manualLimit));
        setManualTotal(Math.max(total, normalized.length));
        setManualLoading(false);
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") return;
        setManualResults([]);
        setManualTotal(0);
        setManualLoading(false);
        setManualError(toUserFacingApiError(error));
      }
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [debouncedManualQuery, manualLimit]);

  useEffect(() => {
    return () => manualAbortRef.current?.abort();
  }, []);

  const filteredSubcategories = useMemo(() => {
    if (!selectedChapter) return [];

    const q = subcategoryQuery.trim().toLowerCase();
    if (!q) return selectedChapter.subcategories;

    return selectedChapter.subcategories.filter((item) => {
      return item.code.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    });
  }, [selectedChapter, subcategoryQuery]);

  const handleBack = () => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
      return;
    }
    if (selectedChapter) {
      setSelectedChapter(null);
      setSubcategoryQuery("");
    }
  };

  const handleCopyFull = async (item: { code: string; description: string }) => {
    try {
      await navigator.clipboard.writeText(`${item.code} - ${item.description}`);
      toast({ title: "Copiado al portapapeles", description: `${item.code} - ${item.description}` });
    } catch {
      toast({
        title: "No se pudo copiar",
        description: "Intenta copiar manualmente el contenido.",
        variant: "destructive",
      });
    }
  };

  const handleCopyCode = async (item: { code: string; description: string }) => {
    try {
      await navigator.clipboard.writeText(item.code);
      toast({ title: "Copiado al portapapeles", description: item.code });
    } catch {
      toast({
        title: "No se pudo copiar",
        description: "Intenta copiar manualmente el código.",
        variant: "destructive",
      });
    }
  };

  const breadcrumb = [
    "CIE-10",
    selectedChapter?.title,
    selectedSubcategory?.code,
  ].filter(Boolean) as string[];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto mt-4 w-full max-w-2xl rounded-2xl border border-border bg-card/70 p-4 backdrop-blur-md"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-turquoise-500">Modo CIE-10 Manual</p>
          <h2 className="text-sm font-semibold text-foreground">Navegación estructurada por capítulos</h2>
        </div>

        {(selectedChapter || selectedSubcategory) && (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition hover:border-turquoise-300 hover:text-turquoise-500"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Atrás
          </button>
        )}
      </div>

      <ICDManualSearch
        query={manualQuery}
        onQueryChange={setManualQuery}
        loading={manualLoading}
        error={manualError}
        results={manualResults}
        total={manualTotal}
        onCopyFull={handleCopyFull}
        onCopyCodeOnly={handleCopyCode}
        onLoadMore={() => setManualLimit((prev) => prev + MANUAL_LIMIT_STEP)}
        canLoadMore={!manualLoading && manualResults.length > 0 && manualResults.length < manualTotal}
      />

      <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      {!hasManualQuery && (selectedChapter || selectedSubcategory) && (
        <p className="mb-3 text-xs text-muted-foreground">{breadcrumb.join(" > ")}</p>
      )}

      {!hasManualQuery && !selectedChapter && (
        <ICDChapterGrid chapters={ICD_CHAPTERS_MVP} onSelect={setSelectedChapter} />
      )}

      {!hasManualQuery && selectedChapter && !selectedSubcategory && (
        <ICDSubcategoryList
          query={subcategoryQuery}
          onQueryChange={setSubcategoryQuery}
          items={filteredSubcategories}
          onSelect={setSelectedSubcategory}
        />
      )}

      {!hasManualQuery && selectedChapter && selectedSubcategory && (
        <ICDCodeList
          items={selectedSubcategory.codes}
          onCopyFull={handleCopyFull}
          onCopyCode={handleCopyCode}
        />
      )}
    </motion.section>
  );
}
