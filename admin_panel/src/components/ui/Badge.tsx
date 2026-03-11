import React from "react";

type BadgeTone = "neutral" | "success" | "danger" | "info" | "warning";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: BadgeTone }): JSX.Element {
  const tones: Record<BadgeTone, React.CSSProperties> = {
    neutral: { background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)" },
    success: { background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.30)" },
    danger: { background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.30)" },
    info: { background: "rgba(0, 180, 216, 0.12)", border: "1px solid rgba(0, 180, 216, 0.30)" },
    warning: { background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.30)" },
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.2,
        color: "var(--text)",
        ...tones[tone],
      }}
    >
      {children}
    </span>
  );
}

