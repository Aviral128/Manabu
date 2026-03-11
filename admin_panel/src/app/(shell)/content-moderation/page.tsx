"use client";

import React from "react";

import { SectionHeader } from "../../../components/common/SectionHeader";
import { DataTable } from "../../../components/tables/DataTable";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";
import { fetchModerationQueue } from "../../../services/content";

type ModerationItem = {
  id: string;
  type: "question" | "comment" | "post";
  risk: "low" | "medium" | "high";
  text: string;
  state: "queued" | "approved" | "rejected" | "escalated";
};

function seedItems(): ModerationItem[] {
  return [
    {
      id: "mod_1001",
      type: "comment",
      risk: "high",
      text: "This content looks unsafe and should be reviewed by a moderator.",
      state: "queued",
    },
    { id: "mod_1002", type: "question", risk: "medium", text: "AI-generated draft: verify correctness and tone.", state: "queued" },
    { id: "mod_1003", type: "post", risk: "low", text: "Celebrating a 7-day streak. Great job!", state: "queued" },
  ];
}

export default function ContentModerationPage(): JSX.Element {
  const [busy, setBusy] = React.useState(false);
  const [queue, setQueue] = React.useState<{ queuedItems: number; flaggedItems: number } | null>(null);
  const [items, setItems] = React.useState<ModerationItem[]>(() => seedItems());
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const data = (await fetchModerationQueue()) as any;
      setQueue({ queuedItems: Number(data.queuedItems ?? 0), flaggedItems: Number(data.flaggedItems ?? 0) });
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
    <div>
      <SectionHeader
        title="Content Moderation"
        subtitle="Review flagged content and approve/reject/escalate items."
        right={
          <Button variant="ghost" onClick={() => void refresh()} disabled={busy}>
            {busy ? <Spinner size={16} /> : null} Refresh
          </Button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 12 }}>
        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Badge tone="info">Queued: {queue?.queuedItems ?? "-"}</Badge>
            <Badge tone="warning">Flagged: {queue?.flaggedItems ?? "-"}</Badge>
            <Badge tone="neutral">Source: content-service</Badge>
          </div>
          {error ? <div style={{ marginTop: 10, color: "var(--danger)" }}>{error}</div> : null}
        </Card>

        <Card style={{ gridColumn: "span 12" }}>
          <DataTable<ModerationItem>
            rows={items}
            searchKeys={["id", "type", "risk", "state", "text"]}
            pageSize={8}
            columns={[
              { key: "id", header: "ID" },
              { key: "type", header: "Type", render: (i) => <Badge tone="neutral">{i.type}</Badge> },
              { key: "risk", header: "Risk", render: (i) => <Badge tone={i.risk === "high" ? "danger" : i.risk === "medium" ? "warning" : "success"}>{i.risk}</Badge> },
              { key: "state", header: "State", render: (i) => <Badge tone={i.state === "approved" ? "success" : i.state === "rejected" ? "danger" : i.state === "escalated" ? "warning" : "info"}>{i.state}</Badge> },
              { key: "text", header: "Content", render: (i) => <span style={{ color: "var(--muted)" }}>{i.text}</span> },
              {
                key: "actions",
                header: "Actions",
                render: (i) => (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button variant="ghost" onClick={() => setItems((prev) => prev.map((x) => (x.id === i.id ? { ...x, state: "approved" } : x)))}>
                      Approve
                    </Button>
                    <Button variant="ghost" onClick={() => setItems((prev) => prev.map((x) => (x.id === i.id ? { ...x, state: "rejected" } : x)))}>
                      Reject
                    </Button>
                    <Button variant="danger" onClick={() => setItems((prev) => prev.map((x) => (x.id === i.id ? { ...x, state: "escalated" } : x)))}>
                      Escalate
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}

