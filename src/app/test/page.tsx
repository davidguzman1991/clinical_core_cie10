import { apiFetch } from "@/lib/api";

export default async function TestPage() {
  const data = await apiFetch("/health", { cache: "no-store" });

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
