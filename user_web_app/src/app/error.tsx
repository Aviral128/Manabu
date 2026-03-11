"use client";
import React from "react";

import { Button, ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { reportClientError } from "../monitoring/client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  React.useEffect(() => {
    reportClientError(error, { type: "next.error", digest: error.digest });
  }, [error]);

  return (
    <main className="container">
      <Card style={{ borderRadius: 28 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, margin: 0 }}>Something broke</h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          A UI error occurred. You can retry or go back to the landing page.
        </p>
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 16,
            border: "1px solid var(--border)",
            background: "rgba(0,0,0,0.06)",
            overflowX: "auto",
          }}
        >
          {error.message}
        </pre>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <Button onClick={() => reset()}>Retry</Button>
          <ButtonLink href="/" variant="ghost">
            Home
          </ButtonLink>
        </div>
      </Card>
    </main>
  );
}
