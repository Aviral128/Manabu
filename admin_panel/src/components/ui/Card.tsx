import React from "react";

import { clsx } from "../../utils/clsx";

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
    <section
      className={clsx("glass", className)}
      style={{
        padding: 16,
        borderRadius: 18,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

