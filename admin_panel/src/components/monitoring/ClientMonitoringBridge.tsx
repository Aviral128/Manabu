"use client";

import React from "react";

import { reportAdminError } from "../../monitoring/client";

export function ClientMonitoringBridge(): JSX.Element | null {
  React.useEffect(() => {
    function onError(event: ErrorEvent) {
      reportAdminError(event.error ?? event.message, {
        type: "window.error",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      reportAdminError(event.reason, { type: "window.unhandledrejection" });
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
