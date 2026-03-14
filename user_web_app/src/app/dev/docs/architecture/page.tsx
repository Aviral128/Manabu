import React from "react";

import { Badge } from "../../../../components/ui/Badge";
import { Card } from "../../../../components/ui/Card";

const services = [
  { name: "Next.js web app", location: "Vercel", desc: "App Router frontend, auth pages, dashboard, and same-origin proxy." },
  { name: "Node.js backend", location: "Railway", desc: "Express + TypeScript + Prisma API for auth, quizzes, admin, and monitoring." },
  { name: "PostgreSQL", location: "Railway", desc: "Primary relational database used by Prisma." },
  { name: "Resend", location: "SaaS", desc: "Email delivery for magic login links and password reset links." },
];

export default function ArchitectureDoc(): JSX.Element {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Card style={{ borderRadius: 28 }}>
        <Badge tone="info">Microservices architecture</Badge>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, margin: "12px 0 0" }}>MANABU System Diagram</h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          This is the current deployed MANABU shape, not the older microservice scaffold. The frontend talks to the
          Railway backend through same-origin Next.js route handlers and proxy endpoints.
        </p>
      </Card>

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
          {services.map((s) => (
            <div key={s.name} style={{ padding: 12, borderRadius: 18, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div style={{ fontWeight: 900 }}>{s.name}</div>
                <Badge tone="neutral">{s.location}</Badge>
              </div>
              <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Backend routing</div>
        <p style={{ color: "var(--muted)", marginTop: 6 }}>
          The backend exposes the production API directly through routes like `/api/auth/*`, `/api/quizzes/*`,
          `/api/admin/*`, and `/api/monitoring/events`. For the developer portal, it also publishes a route catalog at
          `GET /v1/routes` and a status snapshot at `GET /v1/status`.
        </p>
      </Card>
    </div>
  );
}
