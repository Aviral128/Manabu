import React from "react";

import { Badge } from "../ui/Badge";

export function ServiceStatusPill({ ok }: { ok: boolean }): JSX.Element {
  return <Badge tone={ok ? "success" : "danger"}>{ok ? "Healthy" : "Down"}</Badge>;
}

