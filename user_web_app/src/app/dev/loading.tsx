import React from "react";

import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

export default function DevLoading(): JSX.Element {
  return (
    <Card style={{ borderRadius: 28, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Spinner />
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Loading developer tools</div>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>Collecting service routes, health probes, and inspection panels.</div>
        </div>
      </div>
    </Card>
  );
}
