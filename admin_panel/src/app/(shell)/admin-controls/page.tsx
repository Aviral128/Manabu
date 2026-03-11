"use client";

import React from "react";

import { SectionHeader } from "../../../components/common/SectionHeader";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

type ControlState = {
  maintenanceMode: boolean;
  registrationsOpen: boolean;
  aiSafeMode: boolean;
  leaderboardVisibility: "public" | "members" | "hidden";
  moderationStrictness: "balanced" | "strict" | "review_all";
  quietHours: "off" | "22:00-06:00" | "00:00-05:00";
  quizSessionLimit: number;
  incidentBanner: string;
  diagnosticsWindow: "15m" | "1h" | "24h";
};

const STORAGE_KEY = "manabu_admin_controls_v1";

const defaultState: ControlState = {
  maintenanceMode: false,
  registrationsOpen: true,
  aiSafeMode: true,
  leaderboardVisibility: "public",
  moderationStrictness: "balanced",
  quietHours: "22:00-06:00",
  quizSessionLimit: 30,
  incidentBanner: "All systems running normally.",
  diagnosticsWindow: "1h",
};

function loadState(): ControlState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...(JSON.parse(raw) as Partial<ControlState>) };
  } catch {
    return defaultState;
  }
}

export default function AdminControlsPage(): JSX.Element {
  const [state, setState] = React.useState<ControlState>(defaultState);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    setState(loadState());
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSavedAt(new Date().toLocaleTimeString());
  }, [state]);

  return (
    <div>
      <SectionHeader
        title="Admin Controls"
        subtitle="Central operator controls for policy, AI guardrails, diagnostics, and learner-facing platform behavior."
        right={<Badge tone="success">Saved {savedAt ?? "just now"}</Badge>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 12 }}>
        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Badge tone={state.maintenanceMode ? "danger" : "success"}>
              {state.maintenanceMode ? "Maintenance on" : "Platform live"}
            </Badge>
            <Badge tone={state.registrationsOpen ? "success" : "warning"}>
              {state.registrationsOpen ? "Registration open" : "Registration paused"}
            </Badge>
            <Badge tone={state.aiSafeMode ? "info" : "warning"}>
              {state.aiSafeMode ? "AI safe mode locked" : "AI flexible mode"}
            </Badge>
          </div>
        </Card>

        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Platform notice</div>
          <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>
            This banner can be used for maintenance, exam-week mode, or any important operator update.
          </div>
          <textarea
            value={state.incidentBanner}
            onChange={(event) => setState((current) => ({ ...current, incidentBanner: event.target.value }))}
            style={{
              width: "100%",
              minHeight: 110,
              marginTop: 12,
              padding: 12,
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--text)",
            }}
          />
        </Card>

        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <div style={{ padding: 14, borderRadius: 18, border: "1px solid var(--border)", background: "var(--panelStrong)" }}>
              <div style={{ fontWeight: 900 }}>Access controls</div>
              <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>Control core platform availability and sign-up flow.</div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <label style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <span>Maintenance mode</span>
                  <input
                    type="checkbox"
                    checked={state.maintenanceMode}
                    onChange={(event) => setState((current) => ({ ...current, maintenanceMode: event.target.checked }))}
                  />
                </label>
                <label style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <span>Registrations open</span>
                  <input
                    type="checkbox"
                    checked={state.registrationsOpen}
                    onChange={(event) => setState((current) => ({ ...current, registrationsOpen: event.target.checked }))}
                  />
                </label>
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 18, border: "1px solid var(--border)", background: "var(--panelStrong)" }}>
              <div style={{ fontWeight: 900 }}>AI safety</div>
              <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>Tighten or loosen the AI learning assistant posture.</div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <label style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <span>Safe mode</span>
                  <input
                    type="checkbox"
                    checked={state.aiSafeMode}
                    onChange={(event) => setState((current) => ({ ...current, aiSafeMode: event.target.checked }))}
                  />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Moderation strictness</span>
                  <Select
                    value={state.moderationStrictness}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        moderationStrictness: event.target.value as ControlState["moderationStrictness"],
                      }))
                    }
                  >
                    <option value="balanced">balanced</option>
                    <option value="strict">strict</option>
                    <option value="review_all">review all</option>
                  </Select>
                </label>
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 18, border: "1px solid var(--border)", background: "var(--panelStrong)" }}>
              <div style={{ fontWeight: 900 }}>Community controls</div>
              <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>Tune leaderboard exposure and quiet hours.</div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Leaderboard visibility</span>
                  <Select
                    value={state.leaderboardVisibility}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        leaderboardVisibility: event.target.value as ControlState["leaderboardVisibility"],
                      }))
                    }
                  >
                    <option value="public">public</option>
                    <option value="members">members only</option>
                    <option value="hidden">hidden</option>
                  </Select>
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Quiet hours</span>
                  <Select
                    value={state.quietHours}
                    onChange={(event) =>
                      setState((current) => ({ ...current, quietHours: event.target.value as ControlState["quietHours"] }))
                    }
                  >
                    <option value="off">off</option>
                    <option value="22:00-06:00">22:00-06:00</option>
                    <option value="00:00-05:00">00:00-05:00</option>
                  </Select>
                </label>
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 18, border: "1px solid var(--border)", background: "var(--panelStrong)" }}>
              <div style={{ fontWeight: 900 }}>Quiz controls</div>
              <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>Keep live quiz sessions short enough to stay usable.</div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Default live session question limit</span>
                  <Input
                    value={String(state.quizSessionLimit)}
                    onChange={(event) =>
                      setState((current) => ({
                        ...current,
                        quizSessionLimit: Math.min(100, Math.max(10, Number(event.target.value || 30))),
                      }))
                    }
                    inputMode="numeric"
                  />
                </label>
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 18, border: "1px solid var(--border)", background: "var(--panelStrong)" }}>
              <div style={{ fontWeight: 900 }}>Diagnostics window</div>
              <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>Choose how much recent activity operators inspect by default.</div>
              <div style={{ marginTop: 12 }}>
                <Select
                  value={state.diagnosticsWindow}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      diagnosticsWindow: event.target.value as ControlState["diagnosticsWindow"],
                    }))
                  }
                >
                  <option value="15m">15 minutes</option>
                  <option value="1h">1 hour</option>
                  <option value="24h">24 hours</option>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(state, null, 2));
              }}
            >
              Copy configuration
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setState(defaultState);
              }}
            >
              Reset to defaults
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
