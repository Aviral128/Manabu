"use client";

import React from "react";

import { LineChartCard } from "../../../components/charts/LineChartCard";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { DataTable } from "../../../components/tables/DataTable";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Spinner } from "../../../components/ui/Spinner";
import { fetchAnalyticsDashboard, fetchRetention, postAnalyticsEvent } from "../../../services/analytics";
import { formatPercent } from "../../../utils/format";

type MasteryRow = { topic: string; mastery: number };

export default function AnalyticsPage(): JSX.Element {
  const [userId, setUserId] = React.useState("usr_001");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dashboard, setDashboard] = React.useState<any | null>(null);
  const [retention, setRetention] = React.useState<any | null>(null);

  const refresh = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const [dash, ret] = await Promise.all([fetchAnalyticsDashboard(userId), fetchRetention()]);
      setDashboard(dash);
      setRetention(ret);
      await postAnalyticsEvent({ event: "admin.analytics.view", userId, ts: new Date().toISOString() });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const retentionSeries = [
    { label: "D1", value: Math.round(Number(retention?.day1 ?? 0) * 100) },
    { label: "D7", value: Math.round(Number(retention?.day7 ?? 0) * 100) },
    { label: "D30", value: Math.round(Number(retention?.day30 ?? 0) * 100) },
  ];

  const growthSeries = Array.from({ length: 12 }, (_, i) => ({
    label: `W${i + 1}`,
    value: 1200 + i * 180 + Math.round(Math.sin(i / 2) * 120),
  }));

  const quizCompletionSeries = Array.from({ length: 10 }, (_, i) => ({
    label: `D${i + 1}`,
    value: 80 + i * 4 + Math.round(Math.cos(i / 2) * 6),
  }));

  const aiUsageSeries = Array.from({ length: 10 }, (_, i) => ({
    label: `D${i + 1}`,
    value: 35 + i * 3 + Math.round(Math.sin(i / 2) * 5),
  }));

  const masteryRows: MasteryRow[] = Array.isArray(dashboard?.masteryByTopic) ? dashboard.masteryByTopic : [];

  return (
    <div>
      <SectionHeader
        title="Analytics"
        subtitle="Cohorts, performance, and usage. Primary source: analytics-service."
        right={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} style={{ width: 140 }} aria-label="User ID" />
            <Button variant="ghost" onClick={() => void refresh()} disabled={busy}>
              {busy ? <Spinner size={16} /> : null} Refresh
            </Button>
          </div>
        }
      />

      {error ? (
        <Card style={{ marginBottom: 12, border: "1px solid rgba(239, 68, 68, 0.35)" }}>
          <div style={{ fontWeight: 900 }}>Analytics error</div>
          <div style={{ color: "var(--muted)", marginTop: 6 }}>{error}</div>
        </Card>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 12 }}>
        <div style={{ gridColumn: "span 12" }}>
          <Card>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Badge tone="info">Accuracy: {dashboard ? formatPercent(Number(dashboard.accuracy ?? 0)) : "-"}</Badge>
              <Badge tone="neutral">Weekly minutes: {dashboard?.weeklyStudyMinutes ?? "-"}</Badge>
              <Badge tone="warning">Retention D7: {retention ? formatPercent(Number(retention.day7 ?? 0)) : "-"}</Badge>
            </div>
          </Card>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <LineChartCard
            title="User growth"
            subtitle="Demo series (until growth endpoints exist)"
            data={growthSeries}
            color="var(--primary2)"
          />
        </div>
        <div style={{ gridColumn: "span 12" }}>
          <LineChartCard
            title="Quiz completion"
            subtitle="Demo series (connects via analytics refresh)"
            data={quizCompletionSeries}
            color="var(--accent)"
          />
        </div>
        <div style={{ gridColumn: "span 12" }}>
          <LineChartCard
            title="AI usage"
            subtitle="Demo series (AI calls tracked in portal and admin tools)"
            data={aiUsageSeries}
            color="var(--success)"
          />
        </div>
        <div style={{ gridColumn: "span 12" }}>
          <LineChartCard title="Retention snapshot" subtitle="From /v1/analytics/retention" data={retentionSeries} color="var(--accent)" />
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <Card>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Topic mastery (user)</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>From `/v1/analytics/dashboard/:userId`</div>
            <div style={{ marginTop: 12 }}>
              <DataTable<MasteryRow>
                rows={masteryRows}
                searchKeys={["topic"]}
                pageSize={6}
                columns={[
                  { key: "topic", header: "Topic", render: (r) => <span style={{ fontWeight: 900 }}>{r.topic}</span> },
                  {
                    key: "mastery",
                    header: "Mastery",
                    render: (r) => <Badge tone={r.mastery >= 0.75 ? "success" : r.mastery >= 0.5 ? "warning" : "danger"}>{Math.round(r.mastery * 100)}%</Badge>,
                  },
                ]}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

