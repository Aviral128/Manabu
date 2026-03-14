"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import React from "react";

import { useAuth } from "../../auth/AuthProvider";
import { Button, ButtonLink } from "../ui/Button";

export function MarketingNav(): JSX.Element {
  const { theme, systemTheme, setTheme } = useTheme();
  const { state } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const resolved = theme === "system" ? systemTheme : theme;
  const isDark = mounted && resolved === "dark";
  const isAdmin = state.status === "auth" && state.role === "admin";
  const dashboardHref = state.status === "auth" ? "/app/dashboard" : "/login?next=/app/dashboard";
  const mvaSpecialHref = state.status === "auth" ? "/app/quiz/mva-special" : "/login?next=/app/quiz/mva-special";

  return (
    <header
      className="glass"
      style={{
        padding: 14,
        borderRadius: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "linear-gradient(135deg, var(--primary), var(--primary2))",
            boxShadow: "0 18px 60px rgba(56, 189, 248, 0.22)",
            display: "grid",
            placeItems: "center",
            padding: 8,
          }}
        >
          <img src="/brand/manabu-wordmark.svg" alt="MANABU" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </span>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, letterSpacing: 0.3 }}>MANABU</div>
          <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>Learn with rhythm, not chaos</div>
        </div>
      </Link>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Link href={dashboardHref} style={{ color: "var(--muted)", fontWeight: 700, fontSize: 14 }}>
          Product
        </Link>
        <Link href={mvaSpecialHref} style={{ color: "var(--muted)", fontWeight: 700, fontSize: 14 }}>
          MVA Special
        </Link>
        {isAdmin ? (
          <Link href="/dev" style={{ color: "var(--muted)", fontWeight: 700, fontSize: 14 }}>
            Dev
          </Link>
        ) : null}
        <Link href="/about-admin" style={{ color: "var(--muted)", fontWeight: 700, fontSize: 14 }}>
          About Admin
        </Link>
        <Button variant="ghost" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Toggle theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        {state.status === "auth" ? (
          <ButtonLink href="/app/dashboard">Open app</ButtonLink>
        ) : (
          <>
            <ButtonLink href="/login" variant="ghost">
              Login
            </ButtonLink>
            <ButtonLink href="/login">Get started</ButtonLink>
          </>
        )}
      </div>
    </header>
  );
}
