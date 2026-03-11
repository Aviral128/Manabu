import React from "react";

export function Spinner({ size = 18 }: { size?: number }): JSX.Element {
  return (
    <span
      aria-label="Loading"
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        border: "2px solid rgba(0, 180, 216, 0.25)",
        borderTopColor: "var(--primary2)",
        display: "inline-block",
        animation: "spin 0.9s linear infinite",
      }}
    />
  );
}

