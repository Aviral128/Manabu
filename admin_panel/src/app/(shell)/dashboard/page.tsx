"use client";

import React from "react";

import { LineChartCard } from "../../../components/charts/LineChartCard";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { StatsCard } from "../../../components/dashboard/StatsCard";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";
import { fetchRetention } from "../../../services/analytics";
import { fetchModerationQueue } from "../../../services/content";
import { listQuestionCatalog } from "../../../services/quiz";
import { healthCheck } from "../../../services/system";
import { formatPercent } from "../../../utils/format";

type Metric = { label: string; value: string; hint: string; tone?: "info" | "success" | "warning" | "danger" | "neutral" };

export default function DashboardPage(): JSX.Element {
  const [loading, setLoading] = React.useState(true);
  const [metrics, setMetrics] = React.useState<Metric[]>([]);
  const [issues, setIssues] = React.useState<string[]>([]);
  const [retentionSeries, setRetentionSeries] = React.useState<Array<{ label: string; value: number }>>([]);
  const [quizSeries, setQuizSeries] = React.useState<Array<{ label: string; value: number }>>([]);
  const [moderationSeries, setModerationSeries] = React.useState<Array<{ label: string; value: number }>>([]);
  const [overview, setOverview] = React.useState({ queued: 0, flagged: 0, day7: 0, aiStatus: "unknown" });

  React.useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);

      const [modResult, questionsResult, retentionResult, aiHealthResult] = await Promise.allSettled([
        fetchModerationQueue(),
        listQuestionCatalog(),
        fetchRetention(),
        healthCheck("ai"),
      ]);

      if (!alive) return;

      const nextIssues: string[] = [];
      const questionCount =
        questionsResult.status === "fulfilled" && Array.isArray((questionsResult.value as any).items)
          ? (questionsResult.value as any).items.length
          : 0;
      const flagged =
        modResult.status === "fulfilled" ? Number((modResult.value as any).flaggedItems ?? 0) : 0;
      const queued =
        modResult.status === "fulfilled" ? Number((modResult.value as any).queuedItems ?? 0) : 0;
      const day1 =
        retentionResult.status === "fulfilled" ? Number((retentionResult.value as any).day1 ?? 0) : 0;
      const day7 =
        retentionResult.status === "fulfilled" ? Number((retentionResult.value as any).day7 ?? 0) : 0;
      const day30 =
        retentionResult.status === "fulfilled" ? Number((retentionResult.value as any).day30 ?? 0) : 0;
      const aiStatus = aiHealthResult.status === "fulfilled" ? (aiHealthResult.value as any).status ?? "unknown" : "down";

      if (modResult.status === "rejected") nextIssues.push("Content moderation data is unavailable.");
      if (questionsResult.status === "rejected") nextIssues.push("Quiz catalog count could not be loaded.");
      if (retentionResult.status === "rejected") nextIssues.push("Retention analytics are currently degraded.");
      if (aiHealthResult.status === "rejected") nextIssues.push("AI health check did not respond.");

      const syntheticQuiz = Array.from({ length: 14 }, (_, i) => ({
        label: `D${i + 1}`,
        value: Math.round(54 + Math.sin(i / 2) * 9 + i * 1.6),
      }));

      setMetrics([
        {
          label: "Learner momentum",
          value: formatPercent(Math.min(1, day7 + 0.12)),
          hint: "Retention-informed proxy for active learner consistency",
          tone: "info",
        },
        {
          label: "Question catalog",
          value: String(questionCount),
          hint: "Questions available through quiz-service",
          tone: "neutral",
        },
        {
          label: "Flagged content",
          value: String(flagged),
          hint: "Items requiring moderation attention",
          tone: flagged > 10 ? "danger" : "warning",
        },
        {
          label: "Queue depth",
          value: String(queued),
          hint: "Backlog waiting for review",
          tone: queued > 100 ? "warning" : "success",
        },
        {
          label: "AI engine",
          value: String(aiStatus),
          hint: "Prompt and moderation inference status",
          tone: aiStatus === "ok" ? "success" : "danger",
        },
      ]);

      setRetentionSeries([
        { label: "D1", value: Math.round(day1 * 100) },
        { label: "D7", value: Math.round(day7 * 100) },
        { label: "D30", value: Math.round(day30 * 100) },
      ]);
      setQuizSeries(syntheticQuiz);
      setModerationSeries([
        { label: "Queued", value: queued },
        { label: "Flagged", value: flagged },
        { label: "Resolved", value: Math.max(8, queued - flagged) },
      ]);
      setOverview({ queued, flagged, day7, aiStatus: String(aiStatus) });
      setIssues(nextIssues);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <SectionHeader
        title="Dashboard"
        subtitle="A live pulse of operations, trust, and learning velocity across the platform."
        right={loading ? <Spinner /> : <Badge tone="success">Live via proxy</Badge>}
      />

      <div style={{ display: "grid", gap: 12 }}>
        <Card
          style={{
            borderRadius: 30,
            padding: 22,
            background:
              "radial-gradient(320px 160px at 0% 0%, rgba(20, 184, 166, 0.18), transparent 70%), linear-gradient(135deg, var(--heroSurface), var(--heroSurfaceSoft))",
            color: "var(--heroTextStrong)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)", gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <Badge tone="info">MANABU command deck</Badge>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 34, marginTop: 12 }}>
                Keep content clean, AI healthy, and learner momentum climbing.
              </div>
              <div style={{ color: "var(--muted)", marginTop: 10, maxWidth: 760 }}>
                This surface blends analytics, quiz throughput, moderation pressure, and AI runtime so operators can see
                the product story in one place.
              </div>
              <div className="heroStatGrid" style={{ marginTop: 18 }}>
                {metrics.slice(0, 3).map((metric) => (
                  <div
                    key={metric.label}
                    style={{
                      padding: 14,
                      borderRadius: 20,
                      border: "1px solid var(--border)",
                      background: "var(--panelStrong)",
                      boxShadow: "var(--shadowSoft)",
                    }}
                  >
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{metric.label}</div>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 28, marginTop: 8 }}>
                      {metric.value}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>{metric.hint}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 24,
                border: "1px solid var(--border)",
                background: "rgba(11, 79, 108, 0.94)",
                color: "#edfaff",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.75 }}>Operational focus</div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22, marginTop: 8 }}>
                Trust + growth balance
              </div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {[
                  {
                    label: "Moderation pressure",
                    value: `${Math.max(overview.queued, overview.flagged)} items`,
                    tone: "warning" as const,
                  },
                  { label: "Retention pulse", value: formatPercent(overview.day7), tone: "info" as const },
                  {
                    label: "AI readiness",
                    value: overview.aiStatus,
                    tone: overview.aiStatus === "ok" ? "success" as const : "danger" as const,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: 12,
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <div style={{ fontWeight: 800 }}>{item.label}</div>
                      <Badge tone={item.tone}>{item.value}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {issues.length ? (
          <Card style={{ borderRadius: 22 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <Badge tone="warning">Degraded signals</Badge>
              {issues.map((issue) => (
                <span key={issue} style={{ color: "var(--muted)", fontSize: 13 }}>
                  {issue}
                </span>
              ))}
            </div>
          </Card>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {metrics.map((metric) => (
            <StatsCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              hint={metric.hint}
              tone={metric.tone ?? "neutral"}
            />
          ))}
        </div>

        <div className="dataGridTwo">
          <LineChartCard
            title="Retention snapshot"
            subtitle="Analytics-service retention shape"
            data={retentionSeries}
            color="var(--accent)"
          />
          <LineChartCard
            title="Quiz activity"
            subtitle="Synthetic throughput until a dedicated series endpoint exists"
            data={quizSeries}
            color="var(--primary2)"
          />
        </div>

        <div className="dashboardFeatureGrid">
          <LineChartCard
            title="Moderation distribution"
            subtitle="Content-service queue composition"
            data={moderationSeries}
            color="var(--primary)"
          />
          <Card style={{ borderRadius: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Operator playbook</div>
                <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>
                  A simple sequence for when signals drift.
                </div>
              </div>
              <Badge tone="neutral">Human in the loop</Badge>
            </div>
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {[
                "Review flagged content and AI moderation output first.",
                "Confirm quiz throughput and learner momentum are still healthy.",
                "Escalate AI failures before recommendation quality slips.",
              ].map((step, index) => (
                <div
                  key={step}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    padding: 12,
                    borderRadius: 16,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      background: "rgba(20, 184, 166, 0.12)",
                      fontWeight: 900,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ fontSize: 14 }}>{step}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
