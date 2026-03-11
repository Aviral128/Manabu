"use client";

import React from "react";

import { describeApiResult, type PlainLanguageView } from "../../utils/plainLanguage";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function PlainLanguageCard({
  title,
  description,
  data,
  view,
}: {
  title: string;
  description?: string;
  data?: unknown;
  view?: PlainLanguageView;
}): JSX.Element {
  const [showRaw, setShowRaw] = React.useState(false);
  const resolved = view ?? describeApiResult(data);

  return (
    <Card style={{ borderRadius: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>{title}</div>
          {description ? <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>{description}</div> : null}
        </div>
        {data !== undefined ? (
          <Button variant="ghost" onClick={() => setShowRaw((current) => !current)}>
            {showRaw ? "Hide raw" : "View raw"}
          </Button>
        ) : null}
      </div>

      <div style={{ marginTop: 12, padding: 14, borderRadius: 18, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)" }}>
        <div style={{ fontWeight: 900, fontSize: 15 }}>{resolved.headline}</div>
        {resolved.bullets.length ? (
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            {resolved.bullets.map((bullet) => (
              <div key={bullet} style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.55 }}>
                {bullet}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {resolved.facts.length ? (
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {resolved.facts.map((fact) => (
            <div
              key={fact.label}
              style={{
                padding: 12,
                borderRadius: 18,
                border: "1px solid var(--border)",
                background: "var(--panelStrong)",
              }}
            >
              <div style={{ color: "var(--muted)", fontSize: 12 }}>{fact.label}</div>
              <div style={{ fontWeight: 900, marginTop: 6, lineHeight: 1.45 }}>{fact.value}</div>
            </div>
          ))}
        </div>
      ) : null}

      {showRaw && data !== undefined ? (
        <pre
          style={{
            marginTop: 12,
            marginBottom: 0,
            padding: 12,
            borderRadius: 18,
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.03)",
            overflowX: "auto",
            fontSize: 12,
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : null}
    </Card>
  );
}
