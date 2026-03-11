"use client";

import React from "react";

export function useInterval(callback: () => void, delayMs: number | null) {
  const cbRef = React.useRef(callback);
  React.useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (delayMs === null) return;
    const id = setInterval(() => cbRef.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
}

