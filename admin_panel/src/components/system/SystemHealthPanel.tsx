"use client";

import React from "react";

import { useInterval } from "../../hooks/useInterval";
import { HealthResponse, SERVICES, ServiceKey, healthCheck } from "../../services/system";
import { Card } from "../ui/Card";
import { Spinner } from "../ui/Spinner";
import { ServiceStatusPill } from "./ServiceStatusPill";

type ServiceState = {
  ok: boolean;
  last?: HealthResponse;
  latencyMs?: number;
  error?: string;
  updatedAt?: string;
};

export function SystemHealthPanel({ autoRefresh = true }: { autoRefresh?: boolean }): JSX.Element {
  const [state, setState] = React.useState<Record<ServiceKey, ServiceState>>(() => {
    const s: Partial<Record<ServiceKey, ServiceState>> = {};
    for (const svc of SERVICES) s[svc.key] = { ok: false };
    return s as Record<ServiceKey, ServiceState>;
  });
  const [busy, setBusy] = React.useState(false);
  const busyRef = React.useRef(false);

  const refresh = React.useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);

    try {
      const updates: Partial<Record<ServiceKey, ServiceState>> = {};
      await Promise.all(
        SERVICES.map(async (svc) => {
          const t0 = Date.now();
          try {
            const data = await healthCheck(svc.key);
            const latencyMs = Date.now() - t0;
            updates[svc.key] = {
              ok: data.status === "ok",
              last: data,
              latencyMs,
              error: undefined,
              updatedAt: new Date().toISOString(),
            };
          } catch (error) {
            updates[svc.key] = {
              ok: false,
              error: (error as Error).message,
              updatedAt: new Date().toISOString(),
            };
          }
        })
      );

      setState((prev) => ({ ...prev, ...(updates as Record<ServiceKey, ServiceState>) }));
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  useInterval(
    () => {
      void refresh();
    },
    autoRefresh ? 10_000 : null
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 18 }}>Service Health</div>
          <div style={{ color: "var(--muted)", marginTop: 2 }}>Live checks across all running services</div>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--text)",
            cursor: "pointer",
          }}
          aria-label="Refresh health checks"
        >
          {busy ? <Spinner size={16} /> : null}
          Refresh
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        {SERVICES.map((svc) => {
          const s = state[svc.key];
          return (
            <Card key={svc.key} style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 800 }}>{svc.label}</div>
                <ServiceStatusPill ok={s.ok} />
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 12, color: "var(--muted)", fontSize: 13 }}>
                <span>Latency: {s.latencyMs ?? "-"}ms</span>
                <span>Updated: {s.updatedAt ? new Date(s.updatedAt).toLocaleTimeString() : "-"}</span>
              </div>
              {s.error ? (
                <div style={{ marginTop: 10, color: "var(--danger)", fontSize: 13 }}>{s.error}</div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
