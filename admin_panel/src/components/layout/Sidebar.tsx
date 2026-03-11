"use client";

import {
  Activity,
  BarChart3,
  Bell,
  LayoutDashboard,
  ListChecks,
  MessageCircleWarning,
  SlidersHorizontal,
  ShieldAlert,
  Users,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { Badge } from "../ui/Badge";
import { clsx } from "../../utils/clsx";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const nav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/users", label: "Users", icon: <Users size={18} /> },
  { href: "/quizzes", label: "Quizzes", icon: <ListChecks size={18} /> },
  { href: "/content-moderation", label: "Moderation", icon: <ShieldAlert size={18} /> },
  { href: "/analytics", label: "Analytics", icon: <BarChart3 size={18} /> },
  { href: "/notifications", label: "Alerts", icon: <Bell size={18} /> },
  { href: "/social-moderation", label: "Social", icon: <MessageCircleWarning size={18} /> },
  { href: "/ai-tools", label: "AI Tools", icon: <Wand2 size={18} /> },
  { href: "/admin-controls", label: "Controls", icon: <SlidersHorizontal size={18} /> },
  { href: "/system-status", label: "System", icon: <Activity size={18} /> },
];

export function Sidebar(): JSX.Element {
  const pathname = usePathname();

  return (
    <aside
      className="glass"
      style={{
        padding: 16,
        position: "sticky",
        top: 18,
        alignSelf: "flex-start",
        maxHeight: "calc(100vh - 36px)",
        overflow: "auto",
      }}
    >
      <div
        style={{
          padding: 16,
          borderRadius: 24,
          background:
            "radial-gradient(180px 100px at 0% 0%, rgba(20, 184, 166, 0.18), transparent 70%), linear-gradient(135deg, rgba(11, 79, 108, 0.95), rgba(10, 23, 37, 0.92))",
          color: "#f4fbff",
          boxShadow: "var(--shadowSoft)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(207, 250, 254, 0.82))",
              color: "#0b4f6c",
              display: "grid",
              placeItems: "center",
              padding: 8,
            }}
          >
            <img src="/brand/manabu-wordmark.svg" alt="MANABU" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, letterSpacing: 0.3 }}>MANABU</div>
            <div style={{ fontSize: 12, opacity: 0.78, marginTop: 2 }}>Admin command deck</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <Badge tone="info">13 services mapped</Badge>
          <Badge tone="warning">Live moderation</Badge>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontSize: 12, opacity: 0.72 }}>Ops tempo</span>
            <span style={{ fontWeight: 800 }}>Steady</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}>
            <div
              style={{
                width: "72%",
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #2dd4bf, #fbbf24)",
              }}
            />
          </div>
        </div>
      </div>

      <nav className="sidebarNav" style={{ marginTop: 16 }}>
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(active && "navItemActive")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 12px",
                borderRadius: 18,
                border: `1px solid ${active ? "rgba(20, 184, 166, 0.26)" : "transparent"}`,
                color: active ? "var(--text)" : "var(--muted)",
                background: active
                  ? "linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(11, 79, 108, 0.08))"
                  : "transparent",
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 14,
                  border: `1px solid ${active ? "rgba(20, 184, 166, 0.26)" : "var(--border)"}`,
                  background: active ? "rgba(20, 184, 166, 0.12)" : "rgba(255,255,255,0.04)",
                }}
              >
                {item.icon}
              </span>
              <span style={{ fontWeight: 800, fontSize: 14 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 18,
          border: "1px solid var(--border)",
          background: "var(--panelStrong)",
        }}
      >
        <div style={{ fontSize: 12, color: "var(--muted)" }}>Focus right now</div>
        <div style={{ marginTop: 8, fontFamily: "var(--font-heading)", fontWeight: 900 }}>Keep AI + content clean</div>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>
          Start with queue depth, then review social spikes and prompt safety.
        </div>
      </div>
    </aside>
  );
}
