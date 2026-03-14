import { appendLog } from "../dev/logStore";
import { reportClientError } from "../monitoring/client";

export type ApiErrorPayload = { code?: string; message?: string };

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  retries?: number;
  timeoutMs?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractErrorMessage(rawText: string, contentType: string, status: number) {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return `Request failed (${status})`;
  }

  if (contentType.includes("text/html")) {
    const preMatch = trimmed.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    const candidate = preMatch?.[1] ?? trimmed.replace(/<[^>]+>/g, " ");
    return candidate.replace(/\s+/g, " ").trim().slice(0, 240) || `Request failed (${status})`;
  }

  return trimmed.slice(0, 240);
}

export async function apiFetch<T>(service: string, path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body: bodyInit, retries = 1, timeoutMs = 10_000, headers: headersInit, ...rest } = options;

  const url = `/api/proxy/${service}${path.startsWith("/") ? "" : "/"}${path}`;

  const method = String(rest.method ?? "GET").toUpperCase();
  // Our local Fastify services error on POST/PUT/PATCH with an empty body.
  // Default to `{}` so "no-payload" actions (enqueue reminders, create battle, etc.) work reliably.
  const body =
    bodyInit === undefined && (method === "POST" || method === "PUT" || method === "PATCH") ? {} : bodyInit;

  const headers = new Headers(headersInit ?? {});
  if (body !== undefined && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

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
      const started = performance.now();
      try {
        const response = await fetch(url, { ...requestInit, cache: "no-store" });
        const durationMs = performance.now() - started;
        const contentType = response.headers.get("content-type") ?? "";
        const rawText = await response.text();
        let parsedJson: ApiErrorPayload | T | null = null;
        if (contentType.includes("application/json") && rawText.trim()) {
          try {
            parsedJson = JSON.parse(rawText) as ApiErrorPayload | T;
          } catch {
            parsedJson = null;
          }
        }

        appendLog({
          id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
          ts: new Date().toISOString(),
          method: String(requestInit.method ?? "GET"),
          url,
          status: response.status,
          durationMs,
          ok: response.ok,
          requestBody: body === undefined ? undefined : JSON.stringify(body),
          responseBody: rawText.slice(0, 8000),
        });

        if (!response.ok) {
          const payload = parsedJson && typeof parsedJson === "object" ? (parsedJson as ApiErrorPayload) : null;
          const message =
            payload?.message ??
            extractErrorMessage(rawText, contentType, response.status);
          const error = new Error(message);
          (error as any).status = response.status;
          (error as any).code = payload?.code;
          (error as any).alreadyLogged = true;
          throw error;
        }

        if (contentType.includes("application/json")) {
          return (parsedJson ?? ({} as T)) as T;
        }
        return rawText as unknown as T;
      } catch (error) {
        lastError = error as Error;
        if (!(lastError as any).alreadyLogged) {
          appendLog({
            id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
            ts: new Date().toISOString(),
            method: String(requestInit.method ?? "GET"),
            url,
            ok: false,
            error: lastError.message,
            requestBody: body === undefined ? undefined : JSON.stringify(body),
          });
        }
        const isLast = attempt >= retries;
        if (isLast) break;
        await sleep(250 * Math.pow(2, attempt));
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }

  if (!url.includes("/api/monitoring/events")) {
    reportClientError(lastError ?? new Error("Unknown network error"), { type: "api.fetch", url, method });
  }
  throw lastError ?? new Error("Unknown network error");
}
