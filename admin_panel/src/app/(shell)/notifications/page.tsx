"use client";

import React from "react";

import { PlainLanguageCard } from "../../../components/common/PlainLanguageCard";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";
import { triggerAchievementNotification, triggerDailyChallenge, triggerReminders } from "../../../services/notifications";

type NotificationAction = {
  id: "daily_challenge" | "reminders" | "achievement";
  title: string;
  hint: string;
  tone: "info" | "warning" | "success";
  run: () => Promise<unknown>;
};

type RunHistoryItem = {
  id: string;
  title: string;
  at: string;
  result?: unknown;
  error?: string;
};

const actions: NotificationAction[] = [
  {
    id: "daily_challenge",
    title: "Daily challenge",
    hint: "Schedule the daily challenge campaign for active learners.",
    tone: "info",
    run: triggerDailyChallenge,
  },
  {
    id: "reminders",
    title: "Study reminders",
    hint: "Queue reminder notifications for learners who need a nudge.",
    tone: "warning",
    run: triggerReminders,
  },
  {
    id: "achievement",
    title: "Achievement push",
    hint: "Send a celebratory badge or milestone notification.",
    tone: "success",
    run: triggerAchievementNotification,
  },
];

export default function NotificationsPage(): JSX.Element {
  const [busyAction, setBusyAction] = React.useState<NotificationAction["id"] | null>(null);
  const [result, setResult] = React.useState<unknown | null>(null);
  const [activeTitle, setActiveTitle] = React.useState("Daily challenge");
  const [error, setError] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<RunHistoryItem[]>([]);

  async function run(action: NotificationAction) {
    setBusyAction(action.id);
    setError(null);
    setResult(null);
    setActiveTitle(action.title);

    try {
      const response = await action.run();
      setResult(response);
      setHistory((current) => [
        {
          id: `${action.id}_${Date.now()}`,
          title: action.title,
          at: new Date().toLocaleTimeString(),
          result: response,
        },
        ...current,
      ]);
    } catch (caught) {
      const message = (caught as Error).message;
      setError(message);
      setHistory((current) => [
        {
          id: `${action.id}_${Date.now()}`,
          title: action.title,
          at: new Date().toLocaleTimeString(),
          error: message,
        },
        ...current,
      ]);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div>
      <SectionHeader
        title="Notifications"
        subtitle="Trigger and inspect push, reminder, and achievement delivery flows without reading raw payloads."
        right={busyAction ? <Spinner /> : <Badge tone="success">Alert controls ready</Badge>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 12 }}>
        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Badge tone="neutral">Source: notification-service</Badge>
            <Badge tone="info">Human-readable results enabled</Badge>
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {actions.map((action) => {
              const running = busyAction === action.id;
              return (
                <div
                  key={action.id}
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    border: "1px solid var(--border)",
                    background: "var(--panelStrong)",
                  }}
                >
                  <Badge tone={action.tone}>{action.title}</Badge>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, marginTop: 10 }}>{action.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 6, lineHeight: 1.55 }}>{action.hint}</div>
                  <div style={{ marginTop: 12 }}>
                    <Button variant={action.id === "achievement" ? "solid" : "ghost"} onClick={() => void run(action)} disabled={Boolean(busyAction)}>
                      {running ? <Spinner size={16} /> : null}
                      {running ? "Running..." : "Run action"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {error ? (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 16, border: "1px solid rgba(239, 68, 68, 0.35)", background: "rgba(239, 68, 68, 0.10)" }}>
              <div style={{ fontWeight: 900 }}>Notification flow failed</div>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>{error}</div>
            </div>
          ) : null}
        </Card>

        {result ? (
          <div style={{ gridColumn: "span 12" }}>
            <PlainLanguageCard title={`${activeTitle} result`} description="Translated from the notification-service response." data={result} />
          </div>
        ) : null}

        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Recent alert activity</div>
              <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>Latest trigger attempts from this browser session.</div>
            </div>
            <Badge tone="neutral">{history.length} event{history.length === 1 ? "" : "s"}</Badge>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {history.length ? (
              history.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 900 }}>{item.title}</div>
                    <Badge tone={item.error ? "danger" : "success"}>{item.error ? "Failed" : "Completed"} at {item.at}</Badge>
                  </div>
                  <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>
                    {item.error ? item.error : "Response translated above so operators do not have to parse service payloads."}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--muted)" }}>No notification actions have been run from this panel yet.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
