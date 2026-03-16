import React from "react";

export function Card({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}): JSX.Element {
  return (
    <section className={["glass", "card", "cardHover", className].filter(Boolean).join(" ")} style={{ padding: 16, ...style }}>
      {children}
    </section>
  );
}
