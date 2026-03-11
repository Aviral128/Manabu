import React from "react";

import { SectionHeader } from "../../../components/common/SectionHeader";
import { Badge } from "../../../components/ui/Badge";
import { SystemHealthPanel } from "../../../components/system/SystemHealthPanel";

export default function SystemStatusPage(): JSX.Element {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <SectionHeader
        title="System Status"
        subtitle="Live health checks, latency snapshots, and service availability across the local MANABU stack."
        right={<Badge tone="success">Auto refresh</Badge>}
      />
      <SystemHealthPanel autoRefresh />
    </div>
  );
}
