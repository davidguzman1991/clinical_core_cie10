import { apiFetch } from "../api";

export async function searchICD10(query: string): Promise<unknown[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return apiFetch<unknown[]>(`/icd10/search?q=${encodeURIComponent(trimmed)}`);
}
