import React from "react";

import { Badge } from "../../../../components/ui/Badge";
import { Card } from "../../../../components/ui/Card";

const services = [
  { name: "API Gateway", port: 7000, desc: "Unified entrypoint, routing, rate limits" },
  { name: "Auth", port: 7001, desc: "Login, register, tokens" },
  { name: "User", port: 7002, desc: "Profile, preferences, history" },
  { name: "Quiz", port: 7003, desc: "Sessions, scoring hooks" },
  { name: "Learning", port: 7004, desc: "Plans, knowledge graph" },
  { name: "Gamification", port: 7005, desc: "XP, streaks, rewards" },
  { name: "Social", port: 7006, desc: "Friends, battles, leaderboard" },
  { name: "Analytics", port: 7007, desc: "Events, dashboards, retention" },
  { name: "Content", port: 7008, desc: "CMS + moderation queue" },
  { name: "Notifications", port: 7009, desc: "Push/email scheduling" },
  { name: "Sync", port: 7010, desc: "Offline event ingestion" },
  { name: "Recommendations", port: 7011, desc: "Next best action feed" },
  { name: "AI Engine", port: 7100, desc: "Weak topics, generation, tutor" },
];

export default function ArchitectureDoc(): JSX.Element {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Card style={{ borderRadius: 28 }}>
        <Badge tone="info">Microservices architecture</Badge>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, margin: "12px 0 0" }}>MANABU System Diagram</h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          This view is a developer-friendly map of what runs locally. The frontend calls services through a Next.js
          same-origin proxy to avoid CORS.
        </p>
      </Card>

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
          {services.map((s) => (
            <div key={s.name} style={{ padding: 12, borderRadius: 18, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div style={{ fontWeight: 900 }}>{s.name}</div>
                <Badge tone="neutral">:{s.port}</Badge>
              </div>
              <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Gateway routing</div>
        <p style={{ color: "var(--muted)", marginTop: 6 }}>
          Gateway exposes public routes (e.g. `/v1/auth/*`) and forwards to upstream services. In the current local
          scaffold, the gateway publishes a catalog at `GET /v1/routes`.
        </p>
      </Card>
    </div>
  );
}

