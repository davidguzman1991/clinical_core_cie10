const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL;

export function getClinicalApiBase(): string | null {
  const raw = API_URL;
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Guard against common mistakes like trailing '.' or '/'
  const withoutTrailingDot = trimmed.endsWith(".")
    ? trimmed.slice(0, -1)
    : trimmed;

  const withoutTrailingSlash = withoutTrailingDot.endsWith("/")
    ? withoutTrailingDot.slice(0, -1)
    : withoutTrailingDot;

  return withoutTrailingSlash || null;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const base = getClinicalApiBase();
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const requestUrl = `${base}${normalizedEndpoint}`;

  console.info(`[API] Request endpoint: ${requestUrl}`);

  const response = await fetch(requestUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error: ${text}`);
  }

  return response.json() as Promise<T>;
}

export type FetchJsonOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
};

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 350;

type ApiErrorCode = "NETWORK" | "TIMEOUT" | "HTTP" | "UNKNOWN";

export class ApiError extends Error {
  readonly status?: number;
  readonly detail?: string;
  readonly code: ApiErrorCode;
  readonly url: string;

  constructor(
    message: string,
    options: {
      url: string;
      code: ApiErrorCode;
      status?: number;
      detail?: string;
      cause?: unknown;
    }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.detail = options.detail;
    this.code = options.code;
    this.url = options.url;
    this.cause = options.cause;
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAbortError(error: unknown): boolean {
  return (error as { name?: string } | null)?.name === "AbortError";
}

function isRetryableHttpStatus(status?: number) {
  if (!status) return false;
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

async function extractErrorDetail(res: Response): Promise<string | undefined> {
  const contentType = res.headers.get("content-type") || "";
  const raw = await res.text();
  if (!raw) return undefined;

  if (contentType.includes("application/json")) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const detail =
        (typeof parsed.detail === "string" && parsed.detail) ||
        (typeof parsed.message === "string" && parsed.message) ||
        (typeof parsed.error === "string" && parsed.error) ||
        "";
      if (detail) return detail;
    } catch {
      // Fall through and return raw text below.
    }
  }

  return raw;
}

function withTimeoutSignal(
  originalSignal: AbortSignal | null | undefined,
  timeoutMs: number
) {
  const timeoutController = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    timeoutController.abort();
  }, timeoutMs);

  const linkedController = new AbortController();
  const abortLinked = () => linkedController.abort();

  if (originalSignal) {
    if (originalSignal.aborted) {
      abortLinked();
    } else {
      originalSignal.addEventListener("abort", abortLinked, { once: true });
    }
  }

  if (timeoutController.signal.aborted) {
    abortLinked();
  } else {
    timeoutController.signal.addEventListener("abort", abortLinked, { once: true });
  }

  return {
    signal: linkedController.signal,
    wasTimedOut: () => timedOut,
    cleanup: () => {
      clearTimeout(timeoutId);
      if (originalSignal) {
        originalSignal.removeEventListener("abort", abortLinked);
      }
      timeoutController.signal.removeEventListener("abort", abortLinked);
    },
  };
}

async function fetchJsonAttempt<T>(input: string, init: FetchJsonOptions): Promise<T> {
  const timeoutMs = init.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const requestInit: RequestInit = init;
  const { signal, wasTimedOut, cleanup } = withTimeoutSignal(init.signal, timeoutMs);

  try {
    console.info(`[API] Request endpoint: ${input}`);

    const res = await fetch(input, {
      ...requestInit,
      signal,
      headers: {
        Accept: "application/json",
        ...(requestInit.headers ?? {}),
      },
    });

    if (!res.ok) {
      const detail = await extractErrorDetail(res);
      throw new ApiError(`HTTP ${res.status}`, {
        url: input,
        code: "HTTP",
        status: res.status,
        detail,
      });
    }

    return (await res.json()) as T;
  } catch (error) {
    if (isAbortError(error)) {
      if (init.signal?.aborted) throw error;

      if (wasTimedOut()) {
        throw new ApiError(`Request timed out after ${timeoutMs}ms`, {
          url: input,
          code: "TIMEOUT",
          cause: error,
        });
      }
    }

    if (error instanceof ApiError) throw error;

    if (error instanceof TypeError) {
      throw new ApiError(error.message || "Network error", {
        url: input,
        code: "NETWORK",
        cause: error,
      });
    }

    throw new ApiError("Unexpected fetch error", {
      url: input,
      code: "UNKNOWN",
      cause: error,
    });
  } finally {
    cleanup();
  }
}

export function isNetworkLikeError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.code === "NETWORK" || error.code === "TIMEOUT";
  }
  return false;
}

export function toUserFacingApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status && error.detail) {
      return `${error.detail} (HTTP ${error.status})`;
    }
    if (error.status) {
      return `Error del backend (HTTP ${error.status}).`;
    }
    if (error.code === "TIMEOUT") {
      return "El backend tardó demasiado en responder. Intenta nuevamente.";
    }
    if (error.code === "NETWORK") {
      return "No se pudo conectar con el backend (red/CORS). Intenta nuevamente.";
    }
    return error.message;
  }

  return "No se pudo consultar ICD-10. Intenta nuevamente.";
}

export function buildClinicalApiUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined>
): string | null {
  const base = getClinicalApiBase();
  if (!base) return null;

  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(`${base}/${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

export async function fetchJson<T>(input: string, init: FetchJsonOptions = {}): Promise<T> {
  const retries = Math.max(0, init.retries ?? DEFAULT_RETRIES);
  const retryDelayMs = Math.max(0, init.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetchJsonAttempt<T>(input, init);
    } catch (error) {
      if (isAbortError(error) && init.signal?.aborted) {
        throw error;
      }

      const retryable =
        isNetworkLikeError(error) ||
        (error instanceof ApiError && isRetryableHttpStatus(error.status));

      if (!retryable || attempt === retries) {
        throw error;
      }

      const delay = retryDelayMs * (attempt + 1);
      await wait(delay);
    }
  }

  throw new ApiError("Retry loop exited unexpectedly", {
    url: input,
    code: "UNKNOWN",
  });
}
