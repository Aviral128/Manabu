"use client";

import React from "react";

import { MotionIn } from "../../../components/motion/MotionIn";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";
import { aiQuestionGeneration, aiTutorExplanation, aiWeakTopics } from "../../../services/ai";

type Mode = "weak_topics" | "question_generation" | "tutor_explanation";

const DEFAULTS: Record<Mode, any> = {
  weak_topics: { user_id: "usr_001", history: [{ topic_id: "algebra", accuracy: 0.55, attempts: 2, recency_weight: 1.0 }] },
  question_generation: { topic_id: "algebra", difficulty: "medium", count: 5 },
  tutor_explanation: { question_id: "q_001", learner_answer: "B", correct_answer: "C", topic_id: "algebra" },
};

export default function AIPlaygroundPage(): JSX.Element {
  const [mode, setMode] = React.useState<Mode>("weak_topics");
  const [payload, setPayload] = React.useState(JSON.stringify(DEFAULTS.weak_topics, null, 2));
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<any | null>(null);

  React.useEffect(() => {
    setPayload(JSON.stringify(DEFAULTS[mode], null, 2));
    setResult(null);
    setError(null);
  }, [mode]);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    const t0 = performance.now();
    try {
      const parsed = JSON.parse(payload);
      let res: any;
      if (mode === "weak_topics") res = await aiWeakTopics(parsed);
      else if (mode === "question_generation") res = await aiQuestionGeneration(parsed);
      else res = await aiTutorExplanation(parsed);
      setResult({ ms: Math.round(performance.now() - t0), data: res });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MotionIn>
        <Card style={{ borderRadius: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22 }}>AI Playground</div>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>Test AI endpoints against the running AI engine.</div>
            </div>
            <Button onClick={() => void run()} disabled={busy}>
              {busy ? <Spinner size={16} /> : null} Run
            </Button>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <Badge tone="neutral">Service: ai (7100)</Badge>
            <Badge tone="info">Mode: {mode}</Badge>
          </div>
        </Card>
      </MotionIn>

      <Card>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ color: "var(--muted)", fontSize: 12 }}>Endpoint</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            style={{
              padding: "10px 12px",
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.05)",
              color: "var(--text)",
            }}
          >
            <option value="weak_topics">Weak topics</option>
            <option value="question_generation">Question generation</option>
            <option value="tutor_explanation">Tutor explanation</option>
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Request payload (JSON)</div>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            style={{
              width: "100%",
              height: 220,
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

        <div style={{ marginTop: 12 }}>
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
      </Card>
    </div>
  );
}

