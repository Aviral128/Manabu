"use client";

import React from "react";

import { useAuth } from "../../../auth/AuthProvider";
import { PlainLanguagePanel } from "../../../components/common/PlainLanguagePanel";
import { MotionIn } from "../../../components/motion/MotionIn";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";
import { fetchKnowledgeGraph, fetchLearningPlan } from "../../../services/learning";

export default function LearningPage(): JSX.Element {
  const { state } = useAuth();
  const userId = state.status === "auth" ? state.userId : "usr_001";

  const [busy, setBusy] = React.useState(true);
  const [plan, setPlan] = React.useState<any | null>(null);
  const [kg, setKg] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setBusy(true);
      setError(null);
      try {
        const [p, k] = await Promise.all([fetchLearningPlan(userId), fetchKnowledgeGraph(userId)]);
        if (!alive) return;
        setPlan(p);
        setKg(k);
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22 }}>Learning</div>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>Personalized plan + knowledge graph</div>
            </div>
            {busy ? <Spinner /> : <Badge tone="success">Live</Badge>}
          </div>
          {error ? <div style={{ marginTop: 10, color: "var(--danger)" }}>{error}</div> : null}
        </Card>
      </MotionIn>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 12 }}>
        <div style={{ gridColumn: "span 12" }}>
          <Card>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Plan</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>From `/v1/learning/plan/:userId`</div>
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {Array.isArray(plan?.plan)
                ? plan.plan.map((p: any) => (
                    <div key={p.topic} style={{ padding: 12, borderRadius: 18, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontWeight: 900 }}>{p.topic}</div>
                        <Badge tone="info">{Math.round(Number(p.targetMastery ?? 0) * 100)}%</Badge>
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
                        {Array.isArray(p.activities) ? p.activities.join(", ") : "-"}
                      </div>
                    </div>
                  ))
                : <div style={{ color: "var(--muted)" }}>No plan available.</div>}
            </div>
          </Card>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <PlainLanguagePanel
            title="Knowledge graph"
            description="A human-readable view of the learning-service graph response."
            data={kg}
          />
        </div>
      </div>
    </div>
  );
}
