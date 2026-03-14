"use client";

import React from "react";

import { MotionIn } from "../../../components/motion/MotionIn";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";
import { apiFetch } from "../../../services/http";
import { ENDPOINTS, type ApiEndpoint } from "../../../dev/endpointCatalog";

function expandPath(template: string, params: Record<string, string>) {
  let out = template;
  for (const [k, v] of Object.entries(params)) {
    out = out.replaceAll(`:${k}`, encodeURIComponent(v));
  }
  return out;
}

export default function ApiExplorerPage(): JSX.Element {
  const [selected, setSelected] = React.useState<ApiEndpoint>(ENDPOINTS[0]);
  const [params, setParams] = React.useState<Record<string, string>>({
    id: "replace-me",
    slug: "mva-special",
    userId: "usr_001",
    courseId: "course_001",
    sessionId: "quiz_session_mock_001",
  });
  const [body, setBody] = React.useState<string>(JSON.stringify({ demo: true }, null, 2));
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const path = expandPath(selected.path, params);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    const t0 = performance.now();
    try {
      const parsedBody = selected.method === "GET" ? undefined : JSON.parse(body || "{}");
      const res = await apiFetch(selected.service, path, {
        method: selected.method,
        body: parsedBody,
        retries: 0,
        timeoutMs: 20_000,
      });
      setResult({ ms: Math.round(performance.now() - t0), data: res });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const paramHints = Array.from(selected.path.matchAll(/:([A-Za-z0-9_]+)/g)).map((m) => m[1]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MotionIn>
        <Card style={{ borderRadius: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22 }}>API Explorer</div>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>Run requests via same-origin proxy (no CORS issues).</div>
            </div>
            <Button onClick={() => void run()} disabled={busy}>
              {busy ? <Spinner size={16} /> : null} Run
            </Button>
          </div>
        </Card>
      </MotionIn>

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 12 }}>
          <div style={{ gridColumn: "span 12" }}>
            <label style={{ color: "var(--muted)", fontSize: 12 }}>Endpoint</label>
            <select
              value={`${selected.service}|${selected.method}|${selected.path}`}
              onChange={(e) => {
                const [service, method, pathTemplate] = e.target.value.split("|");
                const next = ENDPOINTS.find((x) => x.service === service && x.method === method && x.path === pathTemplate);
                if (next) setSelected(next);
              }}
              style={{
                width: "100%",
                marginTop: 6,
                padding: "10px 12px",
                borderRadius: 16,
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.05)",
                color: "var(--text)",
              }}
            >
              {ENDPOINTS.map((ep) => (
                <option key={`${ep.service}|${ep.method}|${ep.path}`} value={`${ep.service}|${ep.method}|${ep.path}`}>
                  [{ep.service}] {ep.method} {ep.path} - {ep.description}
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: "span 12" }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <Badge tone="info">{selected.service}</Badge>
              <Badge tone="neutral">{selected.method}</Badge>
              <Badge tone="neutral">{path}</Badge>
            </div>
          </div>

          {paramHints.length ? (
            <div style={{ gridColumn: "span 12" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Path params</div>
              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                {paramHints.map((k) => (
                  <label key={k} style={{ display: "grid", gap: 6 }}>
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>{k}</span>
                    <input
                      value={params[k] ?? ""}
                      onChange={(e) => setParams((prev) => ({ ...prev, [k]: e.target.value }))}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 16,
                        border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.05)",
                        color: "var(--text)",
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {selected.method !== "GET" ? (
            <div style={{ gridColumn: "span 12" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Request body (JSON)</div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                style={{
                  width: "100%",
                  height: 180,
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 18,
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text)",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  fontSize: 12,
                }}
              />
            </div>
          ) : null}

          <div style={{ gridColumn: "span 12" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Response</div>
            {error ? <div style={{ marginTop: 8, color: "var(--danger)" }}>{error}</div> : null}
            {result ? (
              <div style={{ marginTop: 8 }}>
                <Badge tone="info">Latency: {result.ms}ms</Badge>
                <pre style={{ marginTop: 10, marginBottom: 0, overflowX: "auto" }}>{JSON.stringify(result.data, null, 2)}</pre>
              </div>
            ) : (
              <div style={{ marginTop: 8, color: "var(--muted)" }}>Run a request to see output.</div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
