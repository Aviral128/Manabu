"use client";

import Link from "next/link";
import React from "react";

import { useAuth } from "../../auth/AuthProvider";

export function SiteFooter(): JSX.Element {
  const { state } = useAuth();
  const isAdmin = state.status === "auth" && state.role === "admin";
  const mvaHref = state.status === "auth" ? "/app/quiz/mva-special" : "/login?next=/app/quiz/mva-special";

  return (
    <footer className="container" style={{ paddingTop: 0 }}>
      <div
        className="glass"
        style={{
          padding: "14px 18px",
          borderRadius: 22,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontWeight: 700 }}>
          Created with <span aria-hidden="true" style={{ color: "#f43f5e" }}>&hearts;</span> by Aviral Sultaniya
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", color: "var(--muted)", fontSize: 14 }}>
          <Link href="/about-admin">About Admin</Link>
          <Link href={mvaHref}>MVA Special</Link>
          {isAdmin ? <Link href="/dev">Developer Portal</Link> : null}
        </div>
      </div>
    </footer>
  );
}
