import { NextRequest, NextResponse } from "next/server";

import { ApiError, buildClinicalApiUrl, fetchJson } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json(
      { detail: "Missing required query parameter: q" },
      { status: 400 }
    );
  }

  const upstreamUrl = buildClinicalApiUrl("clinical/icd10/search", { q });
  if (!upstreamUrl) {
    return NextResponse.json(
      {
        detail:
          "NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_API_URL is not configured on the server.",
      },
      { status: 500 }
    );
  }

  console.info(`[ICD10 proxy] q="${q}" upstream="${upstreamUrl}"`);

  try {
    const payload = await fetchJson<unknown>(upstreamUrl, {
      cache: "no-store",
      timeoutMs: 9000,
      retries: 2,
    });
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      const status = error.status ?? 502;
      const detail = error.detail ?? error.message;
      console.error("[ICD10 proxy] upstream error", {
        status,
        detail,
        url: error.url,
        code: error.code,
      });
      return NextResponse.json({ detail }, { status });
    }

    console.error("[ICD10 proxy] unexpected error", error);
    return NextResponse.json(
      { detail: "No se pudo consultar ICD-10 en el backend." },
      { status: 502 }
    );
  }
}
