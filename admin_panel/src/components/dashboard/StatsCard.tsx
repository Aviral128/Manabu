import React from "react";

import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

type Tone = "info" | "success" | "warning" | "danger" | "neutral";

export function StatsCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: Tone;
}): JSX.Element {
  return (
    <Card style={{ padding: 14, borderRadius: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ color: "var(--muted)", fontSize: 12 }}>{label}</div>
        <Badge tone={tone}>{tone}</Badge>
      </div>
      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 26, marginTop: 10 }}>{value}</div>
      <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>{hint}</div>
    </Card>
  );
}

