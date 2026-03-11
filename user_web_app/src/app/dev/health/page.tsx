"use client";

import React from "react";

import { MotionIn } from "../../../components/motion/MotionIn";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";
import { useInterval } from "../../../hooks/useInterval";
import { SERVICES, type ServiceKey, healthCheck } from "../../../services/system";

type Row = {
  key: ServiceKey;
  ok: boolean;
  status?: string;
  latencyMs?: number;
  updatedAt?: string;
  error?: string;
};

export default function HealthMonitorPage(): JSX.Element {
  const [rows, setRows] = React.useState<Row[]>(() =>
    SERVICES.map((s) => ({ key: s.key, ok: false }))
  );
  const [busy, setBusy] = React.useState(false);
  const [auto, setAuto] = React.useState(true);

  const refresh = React.useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const next: Row[] = [];
    await Promise.all(
      SERVICES.map(async (svc) => {
        const t0 = performance.now();
        try {
          const res = await healthCheck(svc.key);
          next.push({
            key: svc.key,
            ok: res.status === "ok",
            status: res.status,
            latencyMs: Math.round(performance.now() - t0),
            updatedAt: new Date().toISOString(),
          });
        } catch (e) {
          next.push({
            key: svc.key,
            ok: false,
            error: (e as Error).message,
            updatedAt: new Date().toISOString(),
          });
        }
      })
    );
    next.sort((a, b) => a.key.localeCompare(b.key));
    setRows(next);
    setBusy(false);
  }, [busy]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  useInterval(
    () => {
      void refresh();
    },
    auto ? 6_000 : null
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MotionIn>
        <Card style={{ borderRadius: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22 }}>Service Health Monitor</div>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>Polling `/health` via proxy every few seconds.</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ display: "inline-flex", gap: 8, alignItems: "center", color: "var(--muted)" }}>
                <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
                Auto refresh
              </label>
              <Button variant="ghost" onClick={() => void refresh()} disabled={busy}>
                {busy ? <Spinner size={16} /> : null} Refresh
              </Button>
            </div>
          </div>
        </Card>
      </MotionIn>

      <Card>
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((r) => {
            const label = SERVICES.find((s) => s.key === r.key)?.label ?? r.key;
            return (
              <div key={r.key} style={{ padding: 12, borderRadius: 18, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>{label}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <Badge tone={r.ok ? "success" : "danger"}>{r.ok ? "Healthy" : "Down"}</Badge>
                    <Badge tone="neutral">Latency: {r.latencyMs ?? "-"}ms</Badge>
                    <Badge tone="neutral">Updated: {r.updatedAt ? new Date(r.updatedAt).toLocaleTimeString() : "-"}</Badge>
                  </div>
                </div>
                {r.error ? <div style={{ marginTop: 8, color: "var(--danger)" }}>{r.error}</div> : null}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

