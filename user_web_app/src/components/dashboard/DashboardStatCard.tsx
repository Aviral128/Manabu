import React from "react";

import { Card } from "../ui/Card";
import { SkeletonBlock } from "../ui/SkeletonBlock";

function DashboardStatCardInner({
  label,
  value,
  helper,
  loading = false,
}: {
  label: string;
  value: string;
  helper?: string;
  loading?: boolean;
}): JSX.Element {
  return (
    <Card
      style={{
        borderRadius: 22,
        padding: 18,
        background: "linear-gradient(180deg, var(--panelStrong), var(--panel))",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadowSoft)",
      }}
    >
      <div style={{ color: "var(--muted)", fontSize: 12 }}>{label}</div>
      <div style={{ marginTop: 8 }}>
        {loading ? (
          <SkeletonBlock width="62%" height={34} radius={16} />
        ) : (
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "var(--stat-value-size)" }}>{value}</div>
        )}
      </div>
      {helper ? (
        <div style={{ marginTop: 8 }}>
          {loading ? (
            <SkeletonBlock width="100%" height={12} radius={10} style={{ marginBottom: 6 }} />
          ) : (
            <div style={{ color: "var(--muted)", fontSize: 13 }}>{helper}</div>
          )}
        </div>
      ) : null}
    </Card>
  );
}

export const DashboardStatCard = React.memo(DashboardStatCardInner);
