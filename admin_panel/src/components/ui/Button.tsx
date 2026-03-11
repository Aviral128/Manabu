"use client";

import React from "react";

import { clsx } from "../../utils/clsx";

type ButtonVariant = "solid" | "ghost" | "danger";

export function Button({
  children,
  variant = "solid",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }): JSX.Element {
  const styles: Record<ButtonVariant, React.CSSProperties> = {
    solid: {
      background: "linear-gradient(135deg, var(--primary2), var(--primary))",
      color: "#001018",
      border: "1px solid rgba(0, 180, 216, 0.35)",
      boxShadow: "0 12px 34px rgba(0, 180, 216, 0.20)",
    },
    ghost: {
      background: "rgba(255,255,255,0.05)",
      color: "var(--text)",
      border: "1px solid var(--border)",
      boxShadow: "none",
    },
    danger: {
      background: "rgba(239, 68, 68, 0.12)",
      color: "var(--text)",
      border: "1px solid rgba(239, 68, 68, 0.35)",
      boxShadow: "none",
    },
  };

  return (
    <button
      type={type}
      suppressHydrationWarning
      {...props}
      className={clsx("btn", props.className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 14,
        cursor: "pointer",
        transition: "transform 120ms ease, filter 120ms ease, background 120ms ease",
        fontWeight: 700,
        ...styles[variant],
        ...(props.style ?? {}),
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(1px)";
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
        props.onMouseUp?.(e);
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
        props.onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
}
