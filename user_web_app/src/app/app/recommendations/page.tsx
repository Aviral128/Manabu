"use client";

import React from "react";

import { useAuth } from "../../../auth/AuthProvider";
import { MotionIn } from "../../../components/motion/MotionIn";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";
import { fetchRecommendations } from "../../../services/recommendations";

export default function RecommendationsPage(): JSX.Element {
  const { state } = useAuth();
  const userId = state.status === "auth" ? state.userId : "usr_001";

  const [busy, setBusy] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setBusy(true);
      setError(null);
      try {
        const d = await fetchRecommendations(userId);
        if (!alive) return;
        setData(d);
      } catch (e) {
        if (!alive) return;
        setError((e as Error).message);
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MotionIn>
        <Card style={{ borderRadius: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22 }}>Recommendations</div>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>Next best actions for you</div>
            </div>
            {busy ? <Spinner /> : <Badge tone="success">Live</Badge>}
          </div>
          {error ? <div style={{ marginTop: 10, color: "var(--danger)" }}>{error}</div> : null}
        </Card>
      </MotionIn>

      <Card>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Badge tone="neutral">Source: recommendation-service</Badge>
          <Badge tone="info">User: {userId}</Badge>
        </div>
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {Array.isArray(data?.recommendations)
            ? data.recommendations.map((r: any) => (
                <div key={r.id} style={{ padding: 12, borderRadius: 18, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 900 }}>{r.type}</div>
                    <Badge tone="info">{r.id}</Badge>
                  </div>
                  <div style={{ color: "var(--muted)", marginTop: 6 }}>{r.reason}</div>
                </div>
              ))
            : <div style={{ color: "var(--muted)" }}>No recommendations.</div>}
        </div>
      </Card>
    </div>
  );
}

