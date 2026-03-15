import React from "react";

type AlertTone = "info" | "success" | "warning" | "danger";

const toneStyles: Record<AlertTone, React.CSSProperties> = {
  info: {
    background: "rgba(56, 189, 248, 0.12)",
    border: "1px solid rgba(56, 189, 248, 0.26)",
    color: "var(--text)",
  },
  success: {
    background: "rgba(74, 222, 128, 0.12)",
    border: "1px solid rgba(74, 222, 128, 0.26)",
    color: "var(--text)",
  },
  warning: {
    background: "rgba(249, 115, 22, 0.12)",
    border: "1px solid rgba(249, 115, 22, 0.26)",
    color: "var(--text)",
  },
  danger: {
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.26)",
    color: "var(--text)",
  },
};

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div
      role="alert"
      style={{
        padding: "12px 14px",
        borderRadius: 18,
        display: "grid",
        gap: 6,
        ...toneStyles[tone],
      }}
    >
      {title ? <div style={{ fontWeight: 900 }}>{title}</div> : null}
      <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}
