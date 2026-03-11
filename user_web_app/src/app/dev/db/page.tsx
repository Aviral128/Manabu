"use client";

import React from "react";

import { MotionIn } from "../../../components/motion/MotionIn";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";

type Payload = {
  postgres: { path: string; content: string | null };
  mongo: { path: string; content: string | null };
  redis: { path: string; content: string | null };
};

export default function DatabaseViewerPage(): JSX.Element {
  const [busy, setBusy] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<Payload | null>(null);
  const [tab, setTab] = React.useState<"postgres" | "mongo" | "redis">("postgres");

  const refresh = React.useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/dev/schemas", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load schemas (${res.status})`);
      const json = (await res.json()) as Payload;
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const current = data?.[tab];

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MotionIn>
        <Card style={{ borderRadius: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22 }}>Database Viewer</div>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>
                Reads schema/reference files from the repo for local inspection.
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
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant={tab === "postgres" ? "primary" : "ghost"} onClick={() => setTab("postgres")}>
            Postgres
          </Button>
          <Button variant={tab === "mongo" ? "primary" : "ghost"} onClick={() => setTab("mongo")}>
            Mongo
          </Button>
          <Button variant={tab === "redis" ? "primary" : "ghost"} onClick={() => setTab("redis")}>
            Redis
          </Button>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Badge tone="neutral">Source: local repo files</Badge>
          {current?.path ? <Badge tone="info">{current.path}</Badge> : null}
        </div>

        <div style={{ marginTop: 12 }}>
          {busy ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Spinner size={16} /> Loading...
            </div>
          ) : current?.content ? (
            <pre style={{ margin: 0, overflowX: "auto" }}>{current.content}</pre>
          ) : (
            <div style={{ color: "var(--muted)" }}>No content available.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
