"use client";

import React from "react";

export type AsyncState<T> =
  | { status: "idle"; data?: undefined; error?: undefined }
  | { status: "loading"; data?: T; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: T; error: Error };

export function useAsync<T>(fn: () => Promise<T>, deps: React.DependencyList) {
  const [state, setState] = React.useState<AsyncState<T>>({ status: "idle" });

  const run = React.useCallback(async () => {
    setState((prev) => ({ status: "loading", data: prev.data }));
    try {
      const data = await fn();
      setState({ status: "success", data });
      return data;
    } catch (error) {
      setState((prev) => ({ status: "error", data: prev.data, error: error as Error }));
      throw error;
    }
  }, deps);

  React.useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { state, run };
}

