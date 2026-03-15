import React from "react";

export function SkeletonBlock({
  width = "100%",
  height = 16,
  radius = 14,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: React.CSSProperties;
}): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="skeletonBlock"
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}
