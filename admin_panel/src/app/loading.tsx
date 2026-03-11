import React from "react";

import { Card } from "../components/ui/Card";
import { Spinner } from "../components/ui/Spinner";

export default function Loading(): JSX.Element {
  return (
    <main className="container">
      <Card style={{ borderRadius: 28, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Spinner />
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Loading MANABU Admin</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>Preparing dashboards, health data, and moderation tools.</div>
          </div>
        </div>
      </Card>
    </main>
  );
}
