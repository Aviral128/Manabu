"use client";

import React from "react";

import { reportAdminError } from "../monitoring/client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  React.useEffect(() => {
    reportAdminError(error, { type: "next.error", digest: error.digest });
  }, [error]);

  return (
    <main className="container">
      <section className="glass" style={{ padding: 20 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", margin: 0 }}>Something broke</h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          An unexpected UI error occurred. This is isolated to the admin frontend.
        </p>
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "rgba(0,0,0,0.06)",
            overflowX: "auto",
          }}
        >
          {error.message}
        </pre>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            onClick={() => reset()}
            style={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              padding: "10px 12px",
              background: "var(--panelSolid)",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </section>
    </main>
  );
}
