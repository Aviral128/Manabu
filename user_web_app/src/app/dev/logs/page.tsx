"use client";

import React from "react";

import { MotionIn } from "../../../components/motion/MotionIn";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { useLogs } from "../../../dev/logStore";

export default function LogsViewerPage(): JSX.Element {
  const { logs, clearLogs } = useLogs();
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => `${l.method} ${l.url} ${l.status ?? ""} ${l.error ?? ""}`.toLowerCase().includes(q));
  }, [logs, query]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MotionIn>
        <Card style={{ borderRadius: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22 }}>Logs Viewer</div>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>
                Displays request/response logs captured by the frontend proxy client.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Button variant="danger" onClick={() => clearLogs()}>
                Clear
              </Button>
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Input placeholder="Filter logs..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 420, maxWidth: "100%" }} />
            <Badge tone="neutral">{filtered.length} entries</Badge>
          </div>
        </Card>
      </MotionIn>

      <Card>
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.length === 0 ? <div style={{ color: "var(--muted)" }}>No logs yet. Use API Explorer or Health Monitor.</div> : null}
          {filtered.slice(0, 60).map((l) => (
            <details key={l.id} style={{ border: "1px solid var(--border)", borderRadius: 18, background: "rgba(255,255,255,0.04)", padding: 12 }}>
              <summary style={{ cursor: "pointer", listStyle: "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <Badge tone={l.ok ? "success" : "danger"}>{l.ok ? "OK" : "ERR"}</Badge>
                    <span style={{ fontWeight: 900 }}>{l.method}</span>
                    <span style={{ color: "var(--muted)" }}>{l.url}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Badge tone="neutral">{l.status ?? "-"}</Badge>
                    <Badge tone="neutral">{l.durationMs ? `${Math.round(l.durationMs)}ms` : "-"}</Badge>
                    <Badge tone="neutral">{new Date(l.ts).toLocaleTimeString()}</Badge>
                  </div>
                </div>
              </summary>
              <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 13 }}>
                {l.error ? <div style={{ color: "var(--danger)" }}>{l.error}</div> : null}
                {l.requestBody ? (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, color: "var(--text)" }}>Request</div>
                    <pre style={{ marginTop: 6, marginBottom: 0, overflowX: "auto" }}>{l.requestBody}</pre>
                  </div>
                ) : null}
                {l.responseBody ? (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, color: "var(--text)" }}>Response</div>
                    <pre style={{ marginTop: 6, marginBottom: 0, overflowX: "auto" }}>{l.responseBody}</pre>
                  </div>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}

