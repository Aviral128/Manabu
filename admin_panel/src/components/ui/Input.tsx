"use client";

import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  return (
    <input
      suppressHydrationWarning
      {...props}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.05)",
        color: "var(--text)",
        outline: "none",
        ...(props.style ?? {}),
      }}
    />
  );
}
