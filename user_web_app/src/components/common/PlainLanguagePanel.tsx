"use client";

import React from "react";

import { describeApiResult, type PlainLanguageView } from "../../utils/plainLanguage";
import { Card } from "../ui/Card";

export function PlainLanguagePanel({
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
  const resolved = view ?? describeApiResult(data);

  return (
    <Card style={{ borderRadius: 22 }}>
      <div>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>{title}</div>
        {description ? <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>{description}</div> : null}
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
    </Card>
  );
}
