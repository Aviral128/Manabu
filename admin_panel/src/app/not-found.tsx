import Link from "next/link";
import React from "react";

export default function NotFound(): JSX.Element {
  return (
    <main className="container">
      <section className="glass" style={{ padding: 20 }}>
        <h1 style={{ fontFamily: "var(--font-heading)", margin: 0 }}>Page not found</h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>The requested admin page does not exist.</p>
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--panelSolid)",
          }}
        >
          Go to dashboard
        </Link>
      </section>
    </main>
  );
}
