"use client";

import Link, { type LinkProps } from "next/link";
import React from "react";

type Variant = "primary" | "ghost" | "danger";

function getVariantStyle(variant: Variant): React.CSSProperties {
  const variantStyle: Record<Variant, React.CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, var(--primary), var(--primary2))",
      border: "1px solid rgba(56, 189, 248, 0.30)",
      color: "#001018",
      boxShadow: "0 18px 50px rgba(56, 189, 248, 0.16)",
    },
    ghost: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid var(--border)",
      color: "var(--text)",
      boxShadow: "none",
    },
    danger: {
      background: "rgba(239, 68, 68, 0.12)",
      border: "1px solid rgba(239, 68, 68, 0.35)",
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
    padding: "10px 14px",
    borderRadius: 16,
    cursor: "pointer",
    fontWeight: 800,
    letterSpacing: 0.2,
    transition: "transform 120ms ease, filter 120ms ease",
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
  return (
    <button
      type={type}
      suppressHydrationWarning
      {...props}
      style={getBaseStyle(variant, props.style)}
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
        props.onMouseLeave?.(e);
      }}
    >
      {children}
    </Link>
  );
}
