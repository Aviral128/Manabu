import React from "react";

export function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 14,
      }}
    >
      <div>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 22 }}>{title}</div>
        {subtitle ? <div style={{ color: "var(--muted)", marginTop: 4 }}>{subtitle}</div> : null}
      </div>
      {right ? <div style={{ display: "flex", gap: 10, alignItems: "center" }}>{right}</div> : null}
    </div>
  );
}

