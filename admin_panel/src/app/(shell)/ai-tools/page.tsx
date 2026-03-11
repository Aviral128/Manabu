"use client";

import React from "react";

import { PlainLanguageCard } from "../../../components/common/PlainLanguageCard";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Select } from "../../../components/ui/Select";
import { Spinner } from "../../../components/ui/Spinner";
import {
  aiKnowledgeGraph,
  aiPersonalizedPlan,
  aiQuestionGeneration,
  aiTutorExplanation,
  aiWeakTopics,
} from "../../../services/ai";
import { explainAiPayload } from "../../../utils/plainLanguage";

type ToolKey = "weak_topics" | "question_generation" | "tutor_explanation" | "personalized_plan" | "knowledge_graph";

const DEFAULT_PAYLOADS: Record<ToolKey, any> = {
  weak_topics: {
    user_id: "usr_001",
    history: [{ topic_id: "algebra", accuracy: 0.55, attempts: 2, recency_weight: 1.0 }],
  },
  question_generation: { topic_id: "algebra", difficulty: "medium", count: 5 },
  tutor_explanation: { question_id: "q_001", learner_answer: "B", correct_answer: "C", topic_id: "algebra" },
  personalized_plan: { user_id: "usr_001", weak_topics: ["algebra_linear"], available_minutes_per_day: 35 },
  knowledge_graph: { user_id: "usr_001", mastered_topics: ["fractions"], target_topic: "linear_equations" },
};

export default function AIToolsPage(): JSX.Element {
  const [tool, setTool] = React.useState<ToolKey>("weak_topics");
  const [payload, setPayload] = React.useState(JSON.stringify(DEFAULT_PAYLOADS.weak_topics, null, 2));
  const [result, setResult] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [safeMode, setSafeMode] = React.useState(true);
  const [toxicityThreshold, setToxicityThreshold] = React.useState(0.25);
  const payloadExplanation = React.useMemo(() => {
    try {
      return explainAiPayload(tool, JSON.parse(payload));
    } catch {
      return {
        headline: "The JSON editor currently contains invalid syntax.",
        bullets: ["Fix commas, quotes, or brackets so MANABU can explain the request in plain language."],
        facts: [],
      };
    }
  }, [payload, tool]);

  React.useEffect(() => {
    setPayload(JSON.stringify(DEFAULT_PAYLOADS[tool], null, 2));
    setResult(null);
    setError(null);
  }, [tool]);

  async function run() {
    setBusy(true);
    setError(null);
    setResult(null);
    const t0 = performance.now();
    try {
      const parsed = JSON.parse(payload);
      const withControls = { ...parsed, _controls: { safeMode, toxicityThreshold } };
      let res: any;
      if (tool === "weak_topics") res = await aiWeakTopics(withControls);
      else if (tool === "question_generation") res = await aiQuestionGeneration(withControls);
      else if (tool === "tutor_explanation") res = await aiTutorExplanation(withControls);
      else if (tool === "personalized_plan") res = await aiPersonalizedPlan(withControls);
      else res = await aiKnowledgeGraph(withControls);

      const ms = Math.round(performance.now() - t0);
      setResult({ ms, data: res });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <SectionHeader
        title="AI Tools"
        subtitle="Prompt testing + moderation controls for the AI engine."
        right={
          <Button variant="solid" onClick={() => void run()} disabled={busy}>
            {busy ? <Spinner size={16} /> : null} Run
          </Button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 12 }}>
        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Badge tone="neutral">Source: AI engine (7100)</Badge>
            <label style={{ display: "inline-flex", gap: 8, alignItems: "center", color: "var(--muted)" }}>
              <input type="checkbox" checked={safeMode} onChange={(e) => setSafeMode(e.target.checked)} />
              Safe mode
            </label>
            <label style={{ display: "inline-flex", gap: 8, alignItems: "center", color: "var(--muted)" }}>
              Toxicity threshold
              <input
                type="number"
                value={toxicityThreshold}
                step={0.05}
                min={0}
                max={1}
                onChange={(e) => setToxicityThreshold(Number(e.target.value))}
                style={{
                  width: 90,
                  padding: "8px 10px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.05)",
                  color: "var(--text)",
                }}
              />
            </label>
          </div>
        </Card>

        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ color: "var(--muted)", fontSize: 12 }}>Tool</label>
            <Select
              value={tool}
              onChange={(e) => setTool(e.target.value as ToolKey)}
            >
              <option value="weak_topics">Weak-topic detection</option>
              <option value="question_generation">Question generation</option>
              <option value="tutor_explanation">Tutor explanation</option>
              <option value="personalized_plan">Personalized plan</option>
              <option value="knowledge_graph">Knowledge graph</option>
            </Select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
            <div style={{ gridColumn: "span 12" }}>
              <PlainLanguageCard
                title="What this request means"
                description="A plain-language translation of the current JSON payload."
                view={payloadExplanation}
              />
            </div>

            <div style={{ gridColumn: "span 12" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Request payload (JSON)</div>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                style={{
                  width: "100%",
                  height: 240,
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 16,
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text)",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  fontSize: 12,
                }}
              />
            </div>

            <div style={{ gridColumn: "span 12" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Response</div>
              {error ? <div style={{ marginTop: 8, color: "var(--danger)" }}>{error}</div> : null}
              {result ? (
                <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
                  <Badge tone="info">Latency: {result.ms}ms</Badge>
                  <PlainLanguageCard title="AI result" description="Translated from the AI engine response." data={result.data} />
                </div>
              ) : (
                <div style={{ marginTop: 8, color: "var(--muted)" }}>Run a tool to see output.</div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
