"use client";

import { Activity, Book, Database, FileText, FlaskConical, Home, Logs, TerminalSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { clsx } from "../../utils/clsx";
import { Badge } from "../ui/Badge";
import { ButtonLink } from "../ui/Button";

type Nav = { href: string; label: string; icon: React.ReactNode };

const nav: Nav[] = [
  { href: "/dev", label: "Overview", icon: <Home size={18} /> },
  { href: "/dev/api-explorer", label: "API Explorer", icon: <TerminalSquare size={18} /> },
  { href: "/dev/health", label: "Health Monitor", icon: <Activity size={18} /> },
  { href: "/dev/logs", label: "Logs Viewer", icon: <Logs size={18} /> },
  { href: "/dev/ai-playground", label: "AI Playground", icon: <FlaskConical size={18} /> },
  { href: "/dev/db", label: "Database Viewer", icon: <Database size={18} /> },
  { href: "/dev/docs/architecture", label: "Architecture", icon: <Book size={18} /> },
  { href: "/dev/docs/api", label: "API Docs", icon: <FileText size={18} /> },
];

export function DevShell({ children }: { children: React.ReactNode }): JSX.Element {
  const pathname = usePathname();

  return (
    <div className="devLayout">
      <aside className="devAside">
        <div className="glass" style={{ padding: 16, borderRadius: 24, position: "sticky", top: 18, alignSelf: "flex-start" }}>
          <div
            style={{
              padding: 16,
              borderRadius: 22,
              background:
                "radial-gradient(220px 120px at 0% 0%, rgba(56, 189, 248, 0.2), transparent 66%), linear-gradient(135deg, rgba(7, 17, 35, 0.98), rgba(9, 30, 56, 0.95))",
              color: "#eef7ff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(191, 219, 254, 0.82))",
                  display: "grid",
                  placeItems: "center",
                  padding: 8,
                }}
              >
                <img src="/brand/manabu-wordmark.svg" alt="MANABU" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Developer Portal</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>Live introspection tools</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              <Badge tone="info">/dev</Badge>
              <Badge tone="success">Same-origin proxy</Badge>
            </div>

            <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.5, opacity: 0.82 }}>
              Inspect routes, replay API calls, review request logs, and sanity-check the local stack without leaving the product.
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <ButtonLink href="/app/dashboard" variant="ghost">
              Back to app
            </ButtonLink>
            <ButtonLink href="/about-admin" variant="ghost">
              About Admin
            </ButtonLink>
          </div>

          <nav className="appNav" style={{ marginTop: 14 }}>
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(active && "active")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 12px",
                    borderRadius: 18,
                    border: `1px solid ${active ? "rgba(56, 189, 248, 0.28)" : "transparent"}`,
                    background: active
                      ? "linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(255,255,255,0.04))"
                      : "transparent",
                    color: active ? "var(--text)" : "var(--muted)",
                  }}
                >
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      border: "1px solid var(--border)",
                      background: "rgba(255,255,255,0.05)",
                    }}
                  >
                    {item.icon}
                  </span>
                  <span style={{ fontWeight: 900, fontSize: 14 }}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="shellMain">{children}</main>
    </div>
  );
}
