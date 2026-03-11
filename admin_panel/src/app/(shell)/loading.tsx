import React from "react";

import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

export default function ShellLoading(): JSX.Element {
  return (
    <Card style={{ borderRadius: 28, padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Spinner />
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Syncing operations view</div>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>Fetching live service data through the admin proxy.</div>
        </div>
      </div>
    </Card>
  );
}
