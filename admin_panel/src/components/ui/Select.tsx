"use client";

import { ChevronDown } from "lucide-react";
import React from "react";

export function Select({
  children,
  style,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>): JSX.Element {
  return (
    <span style={{ position: "relative", display: "inline-flex", width: "100%" }}>
      <select
        {...props}
        style={{
          width: "100%",
          padding: "10px 40px 10px 12px",
          borderRadius: 14,
          border: "1px solid var(--border)",
          background: "rgba(255,255,255,0.05)",
          color: "var(--text)",
          appearance: "none",
          outline: "none",
          ...(style ?? {}),
        }}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "var(--muted)",
        }}
      />
    </span>
  );
}
