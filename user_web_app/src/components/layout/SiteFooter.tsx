"use client";

import Link from "next/link";
import React from "react";

import { useAuth } from "../../auth/AuthProvider";

export function SiteFooter(): JSX.Element {
  const { state } = useAuth();
  const isAdmin = state.status === "auth" && state.role === "admin";
  const mvaHref = state.status === "auth" ? "/app/quiz/mva-special" : "/login?next=/app/quiz/mva-special";
  const dashboardHref = state.status === "auth" ? "/app/dashboard" : "/signup";

  return (
    <footer className="container" style={{ paddingTop: 0 }}>
      <div
        className="glass"
        style={{
          padding: "18px 20px",
          borderRadius: 22,
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, letterSpacing: 0.2 }}>MANABU</div>
          <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>Learn with rhythm, not chaos</div>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", color: "var(--muted)", fontSize: 14 }}>
          <Link href="/">Home</Link>
          <Link href={dashboardHref}>Dashboard</Link>
          <Link href={mvaHref}>Quizzes</Link>
          <span>GitHub (coming soon)</span>
          {isAdmin ? <Link href="/dev">Developer Portal</Link> : null}
        </div>
      </div>
    </footer>
  );
}
