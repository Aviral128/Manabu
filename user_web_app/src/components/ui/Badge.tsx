import React from "react";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }): JSX.Element {
  const styles: Record<Tone, React.CSSProperties> = {
    neutral: { background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)" },
    info: { background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.30)" },
    success: { background: "rgba(74, 222, 128, 0.12)", border: "1px solid rgba(74, 222, 128, 0.30)" },
    warning: { background: "rgba(249, 115, 22, 0.12)", border: "1px solid rgba(249, 115, 22, 0.30)" },
    danger: { background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.30)" },
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: 0.2,
        ...styles[tone],
      }}
    >
      {children}
    </span>
  );
}

