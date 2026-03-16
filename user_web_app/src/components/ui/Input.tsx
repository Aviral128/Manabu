"use client";

import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return (
    <input
      suppressHydrationWarning
      {...props}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 18,
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.08)",
        color: "var(--text)",
        outline: "none",
        ...(props.style ?? {}),
      }}
    />
  );
}
