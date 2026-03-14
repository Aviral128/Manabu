"use client";

import React from "react";

import { MotionIn } from "../../../../components/motion/MotionIn";
import { Badge } from "../../../../components/ui/Badge";
import { Card } from "../../../../components/ui/Card";
import { ENDPOINTS } from "../../../../dev/endpointCatalog";
import { apiFetch } from "../../../../services/http";

export default function ApiDocsPage(): JSX.Element {
  const [gatewayRoutes, setGatewayRoutes] = React.useState<any | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("backend", "/v1/routes");
        setGatewayRoutes(data);
      } catch {
        setGatewayRoutes(null);
      }
    })();
  }, []);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MotionIn>
        <Card style={{ borderRadius: 28 }}>
          <Badge tone="info">API docs</Badge>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, margin: "12px 0 0" }}>Endpoints</h1>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>
            The dev portal lists known endpoints and lets you call them through the proxy.
          </p>
        </Card>
      </MotionIn>

      <Card>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Backend route catalog</div>
        <div style={{ color: "var(--muted)", marginTop: 6 }}>Live from `GET /v1/routes` on the Railway backend</div>
        <pre style={{ marginTop: 10, marginBottom: 0, overflowX: "auto" }}>{JSON.stringify(gatewayRoutes, null, 2)}</pre>
      </Card>

      <Card>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Known endpoints</div>
        <div style={{ color: "var(--muted)", marginTop: 6 }}>Static catalog used by the API Explorer</div>
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {ENDPOINTS.map((ep) => (
            <div key={`${ep.service}|${ep.method}|${ep.path}`} style={{ padding: 12, borderRadius: 18, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <Badge tone="neutral">{ep.service}</Badge>
                <Badge tone="info">{ep.method}</Badge>
                <span style={{ fontWeight: 900 }}>{ep.path}</span>
              </div>
              <div style={{ color: "var(--muted)", marginTop: 6 }}>{ep.description}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
