"use client";

import Link, { type LinkProps } from "next/link";
import React from "react";

type Variant = "primary" | "ghost" | "danger";

function getVariantStyle(variant: Variant): React.CSSProperties {
  const variantStyle: Record<Variant, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, var(--primary), var(--primary2))",
      border: "1px solid rgba(56, 189, 248, 0.35)",
      color: "#001018",
      boxShadow: "0 16px 36px rgba(14, 165, 233, 0.22)",
    },
    ghost: {
      background: "rgba(255,255,255,0.08)",
      border: "1px solid var(--border)",
      color: "var(--text)",
      boxShadow: "none",
    },
    danger: {
      background: "rgba(239, 68, 68, 0.14)",
      border: "1px solid rgba(239, 68, 68, 0.4)",
      color: "var(--text)",
      boxShadow: "none",
    },
  };

  return variantStyle[variant];
}

function getBaseStyle(variant: Variant, style?: React.CSSProperties): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "var(--button-pad)",
    minHeight: "var(--button-height)",
    borderRadius: "var(--button-radius)",
    cursor: "pointer",
    fontWeight: 800,
    letterSpacing: 0.2,
    transition: "transform 150ms ease, filter 150ms ease, box-shadow 150ms ease",
    textDecoration: "none",
    ...getVariantStyle(variant),
    ...(style ?? {}),
  };
}

export function Button({
  children,
  variant = "primary",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }): JSX.Element {
  const disabled = Boolean(props.disabled);

  return (
    <button
      type={type}
      suppressHydrationWarning
      {...props}
      style={{
        ...getBaseStyle(variant, props.style),
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        filter: disabled ? "saturate(0.65)" : undefined,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.02)";
        props.onMouseEnter?.(e);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(1px)";
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
        props.onMouseUp?.(e);
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
        (e.currentTarget as HTMLButtonElement).style.filter = disabled ? "saturate(0.65)" : "";
        props.onMouseLeave?.(e);
      }}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: React.ReactNode;
    variant?: Variant;
  };

export function ButtonLink({ children, href, variant = "primary", ...props }: ButtonLinkProps): JSX.Element {
  return (
    <Link
      href={href}
      suppressHydrationWarning
      {...props}
      style={getBaseStyle(variant, props.style)}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1.02)";
        props.onMouseEnter?.(e);
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(1px)";
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0px)";
        props.onMouseUp?.(e);
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0px)";
        (e.currentTarget as HTMLAnchorElement).style.filter = "";
        props.onMouseLeave?.(e);
      }}
    >
      {children}
    </Link>
  );
}
