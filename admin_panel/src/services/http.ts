import { reportAdminError } from "../monitoring/client";

export type ApiErrorPayload = { code?: string; message?: string };

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  retries?: number;
  timeoutMs?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const {
    body: bodyInit,
    retries = 1,
    timeoutMs = 10_000,
    headers: headersInit,
    ...rest
  } = options;

  const method = String(rest.method ?? "GET").toUpperCase();
  // Several Fastify services in this repo return 500 for POST/PUT/PATCH requests with an empty body.
  // Defaulting to `{}` makes the request well-formed JSON without changing call sites.
  const body =
    bodyInit === undefined && (method === "POST" || method === "PUT" || method === "PATCH") ? {} : bodyInit;

  const headers = new Headers(headersInit ?? {});
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const requestInit: RequestInit = {
    ...rest,
    headers,
    signal: controller.signal,
    body: body === undefined ? undefined : JSON.stringify(body),
  };

  let lastError: Error | null = null;
  try {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await fetch(path, { ...requestInit, cache: "no-store" });
        if (!response.ok) {
          let payload: ApiErrorPayload | null = null;
          try {
            payload = (await response.json()) as ApiErrorPayload;
          } catch {
            payload = null;
          }
          const message = payload?.message ?? `Request failed (${response.status})`;
          const error = new Error(message);
          (error as any).status = response.status;
          (error as any).code = payload?.code;
          throw error;
        }

        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          return (await response.json()) as T;
        }
        return (await response.text()) as unknown as T;
      } catch (error) {
        lastError = error as Error;
        const isLast = attempt >= retries;
        if (isLast) break;
        await sleep(250 * Math.pow(2, attempt));
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }

  if (!path.includes("/api/monitoring/events")) {
    reportAdminError(lastError ?? new Error("Unknown network error"), { type: "api.fetch", path, method });
  }
  throw lastError ?? new Error("Unknown network error");
}
