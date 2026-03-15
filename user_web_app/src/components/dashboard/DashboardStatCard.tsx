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
        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.86), rgba(15, 23, 42, 0.72))",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        boxShadow: "0 20px 50px rgba(2, 8, 23, 0.28)",
      }}
    >
      <div style={{ color: "rgba(191, 219, 254, 0.76)", fontSize: 12 }}>{label}</div>
      <div style={{ marginTop: 8 }}>
        {loading ? (
          <SkeletonBlock width="62%" height={34} radius={16} />
        ) : (
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 30, color: "#f8fbff" }}>{value}</div>
        )}
      </div>
      {helper ? (
        <div style={{ marginTop: 8 }}>
          {loading ? (
            <SkeletonBlock width="100%" height={12} radius={10} style={{ marginBottom: 6 }} />
          ) : (
            <div style={{ color: "rgba(211, 225, 244, 0.74)", fontSize: 13 }}>{helper}</div>
          )}
        </div>
      ) : null}
    </Card>
  );
}

export const DashboardStatCard = React.memo(DashboardStatCardInner);
