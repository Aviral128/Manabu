import React from "react";

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}): JSX.Element {
  return (
    <section className="glass" style={{ padding: 16, ...style }}>
      {children}
    </section>
  );
}

