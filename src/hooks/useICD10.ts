"use client";

import { useState } from "react";
import { searchICD10 } from "@/lib/services/icd10";

export function useICD10() {
  const [results, setResults] = useState<unknown[]>([]);

  async function search(q: string) {
    const data = await searchICD10(q);
    setResults(data);
  }

  return { results, search };
}
