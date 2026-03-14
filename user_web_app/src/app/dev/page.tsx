"use client";

import React from "react";

import { MotionIn } from "../../components/motion/MotionIn";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { apiFetch } from "../../services/http";

export default function DevHome(): JSX.Element {
  const [busy, setBusy] = React.useState(true);
  const [routes, setRoutes] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await apiFetch("backend", "/v1/routes");
      setRoutes(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MotionIn>
        <Card style={{ borderRadius: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22 }}>System overview</div>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>
                Explore endpoints, health, request logs, and schemas without touching backend code.
              </div>
            </div>
            <Button variant="ghost" onClick={() => void refresh()} disabled={busy}>
              {busy ? <Spinner size={16} /> : null} Refresh
            </Button>
          </div>
          {error ? <div style={{ marginTop: 10, color: "var(--danger)" }}>{error}</div> : null}
        </Card>
      </MotionIn>

      <Card>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Badge tone="info">Backend routes</Badge>
          <Badge tone="neutral">GET /v1/routes</Badge>
        </div>
        <div style={{ marginTop: 12 }}>
          {routes ? <pre style={{ margin: 0, overflowX: "auto" }}>{JSON.stringify(routes, null, 2)}</pre> : <div style={{ color: "var(--muted)" }}>No data.</div>}
        </div>
      </Card>
    </div>
  );
}
