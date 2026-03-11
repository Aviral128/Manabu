"use client";

import {
  Activity,
  BarChart3,
  Bell,
  ChevronDown,
  ListChecks,
  MessageCircleWarning,
  Moon,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Users,
  Wand2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type MenuKey = "search" | "notifications" | "profile" | null;

const quickLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    hint: "Platform pulse, AI health, and moderation overview",
    icon: <BarChart3 size={16} />,
    tags: ["overview", "metrics", "home", "stats"],
  },
  {
    href: "/users",
    label: "Users",
    hint: "Search learner accounts, edit profiles, suspend access",
    icon: <Users size={16} />,
    tags: ["accounts", "profiles", "members", "search"],
  },
  {
    href: "/quizzes",
    label: "Quizzes",
    hint: "Manage templates, difficulty, and question banks",
    icon: <ListChecks size={16} />,
    tags: ["questions", "difficulty", "templates", "mva"],
  },
  {
    href: "/content-moderation",
    label: "Moderation",
    hint: "Review queued and flagged content",
    icon: <ShieldAlert size={16} />,
    tags: ["queue", "flags", "review"],
  },
  {
    href: "/notifications",
    label: "Alerts",
    hint: "Trigger reminders, achievements, and challenges",
    icon: <Bell size={16} />,
    tags: ["notifications", "push", "alerts", "reminders"],
  },
  {
    href: "/social-moderation",
    label: "Social",
    hint: "Inspect leaderboard activity and friend graph actions",
    icon: <MessageCircleWarning size={16} />,
    tags: ["leaderboard", "friends", "battle", "social"],
  },
  {
    href: "/ai-tools",
    label: "AI Tools",
    hint: "Prompt testing, safety controls, and payload translation",
    icon: <Wand2 size={16} />,
    tags: ["prompt", "payload", "moderation", "ai"],
  },
  {
    href: "/admin-controls",
    label: "Controls",
    hint: "Policy toggles, platform configuration, and operator settings",
    icon: <SlidersHorizontal size={16} />,
    tags: ["settings", "controls", "policy", "config"],
  },
  {
    href: "/system-status",
    label: "System",
    hint: "Check service health across the stack",
    icon: <Activity size={16} />,
    tags: ["health", "status", "services"],
  },
];

const notificationFeed = [
  { label: "Moderation backlog rose by 12 items", hint: "Open the content queue to clear the spike.", href: "/content-moderation" },
  { label: "Reminder run is ready", hint: "Trigger the learner reminder flow from Alerts.", href: "/notifications" },
  { label: "AI prompt checks are healthy", hint: "Open AI Tools to verify the next prompt.", href: "/ai-tools" },
];

function menuContains(ref: React.RefObject<HTMLDivElement | null>, target: EventTarget | null) {
  return Boolean(ref.current && target instanceof Node && ref.current.contains(target));
}

export function Topbar(): JSX.Element {
  const { theme, setTheme, systemTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [todayLabel, setTodayLabel] = React.useState("Today");
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDark = mounted && resolvedTheme === "dark";

  const [query, setQuery] = React.useState("");
  const [openMenu, setOpenMenu] = React.useState<MenuKey>(null);
  const [statusNote, setStatusNote] = React.useState("Searching is live across the admin workspace.");
  const searchRef = React.useRef<HTMLDivElement>(null);
  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    setTodayLabel(
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date())
    );
  }, []);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target;
      const insideKnownMenu =
        menuContains(searchRef, target) || menuContains(notificationsRef, target) || menuContains(profileRef, target);
      if (!insideKnownMenu) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const searchResults = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quickLinks.slice(0, 5);
    return quickLinks.filter((item) => {
      const haystack = [item.label, item.hint, item.href, ...item.tags].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  function openRoute(href: string, note?: string) {
    router.push(href);
    setOpenMenu(null);
    setQuery("");
    if (note) {
      setStatusNote(note);
    }
  }

  return (
    <header
      className="glass topbarShell"
      style={{
        padding: 14,
        borderRadius: 24,
      }}
    >
      <div className="topbarMain">
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div
            aria-hidden="true"
            style={{
              width: 46,
              height: 46,
              borderRadius: 18,
              border: "1px solid var(--border)",
              background: "linear-gradient(135deg, rgba(20, 184, 166, 0.18), rgba(11, 79, 108, 0.12))",
              display: "grid",
              placeItems: "center",
              boxShadow: "var(--shadowSoft)",
              padding: 8,
            }}
          >
            <img src="/brand/manabu-wordmark.svg" alt="MANABU" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, letterSpacing: 0.2 }}>Operations center</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{statusNote}</div>
          </div>
        </div>

        <div className="topbarSearch" ref={searchRef} style={{ position: "relative" }}>
          <Input
            placeholder="Search users, quizzes, alerts, health..."
            aria-label="Search platform records"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setOpenMenu("search")}
            onKeyDown={(event) => {
              if (event.key === "Enter" && searchResults[0]) {
                openRoute(searchResults[0].href, `Jumped to ${searchResults[0].label}.`);
              }
            }}
            style={{ paddingLeft: 38 }}
          />
          <Search
            size={16}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted)",
            }}
          />

          {openMenu === "search" ? (
            <div
              style={{
                position: "absolute",
                inset: "calc(100% + 10px) 0 auto 0",
                padding: 10,
                borderRadius: 20,
                border: "1px solid var(--border)",
                background: "var(--menuSurface)",
                backdropFilter: "blur(18px)",
                boxShadow: "var(--shadow)",
                zIndex: 60,
              }}
            >
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
                {query.trim() ? `Results for "${query.trim()}"` : "Quick access"}
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {searchResults.length ? (
                  searchResults.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => openRoute(item.href, `Jumped to ${item.label}.`)}
                        style={{
                          display: "flex",
                          width: "100%",
                          gap: 12,
                          alignItems: "flex-start",
                          textAlign: "left",
                          padding: 12,
                          borderRadius: 16,
                          border: `1px solid ${active ? "rgba(20, 184, 166, 0.3)" : "var(--border)"}`,
                          background: active ? "rgba(20, 184, 166, 0.10)" : "rgba(255,255,255,0.04)",
                          color: "var(--text)",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ width: 34, height: 34, borderRadius: 14, display: "grid", placeItems: "center", border: "1px solid var(--border)" }}>
                          {item.icon}
                        </span>
                        <span style={{ display: "grid", gap: 4 }}>
                          <span style={{ fontWeight: 900 }}>{item.label}</span>
                          <span style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.45 }}>{item.hint}</span>
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div style={{ padding: 12, borderRadius: 16, border: "1px solid var(--border)", color: "var(--muted)" }}>
                    No admin pages matched that search yet.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Badge tone="success">
          <ShieldCheck size={14} style={{ marginRight: 6 }} />
          All systems mapped
        </Badge>
        <Badge tone="neutral">{todayLabel}</Badge>

        <Button
          variant="ghost"
          onClick={() => {
            setTheme(isDark ? "light" : "dark");
            setStatusNote(`Switched to ${isDark ? "light" : "dark"} theme.`);
          }}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <div ref={notificationsRef} style={{ position: "relative" }}>
          <Button
            variant="ghost"
            aria-label="Notifications"
            onClick={() => setOpenMenu((current) => (current === "notifications" ? null : "notifications"))}
          >
            <Bell size={18} />
            <span style={{ marginLeft: 6, fontSize: 12, color: "var(--muted)" }}>{notificationFeed.length}</span>
          </Button>

          {openMenu === "notifications" ? (
            <div
              style={{
                position: "absolute",
                right: 0,
                marginTop: 8,
                width: 340,
                maxWidth: "min(340px, calc(100vw - 32px))",
                padding: 12,
                borderRadius: 18,
                zIndex: 60,
                border: "1px solid var(--border)",
                background: "var(--menuSurface)",
                boxShadow: "var(--shadow)",
              }}
            >
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>Notifications</div>
              <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                {notificationFeed.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => openRoute(item.href, item.label)}
                    style={{
                      padding: 10,
                      borderRadius: 14,
                      border: "1px solid var(--border)",
                      background: "rgba(255,255,255,0.05)",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "var(--text)",
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 13 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{item.hint}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div ref={profileRef} style={{ position: "relative" }}>
          <Button
            variant="solid"
            aria-label="Open user menu"
            onClick={() => setOpenMenu((current) => (current === "profile" ? null : "profile"))}
          >
            Platform Admin
            <ChevronDown size={16} />
          </Button>

          {openMenu === "profile" ? (
            <div
              style={{
                position: "absolute",
                right: 0,
                marginTop: 8,
                width: 260,
                padding: 10,
                borderRadius: 18,
                zIndex: 60,
                border: "1px solid var(--border)",
                background: "var(--menuSurface)",
                boxShadow: "var(--shadow)",
              }}
            >
              {[
                { label: "Profile summary", hint: "Open the user workspace to inspect accounts", href: "/users" },
                { label: "Audit workflow", hint: "Check system status and service health", href: "/system-status" },
                { label: "Moderation inbox", hint: "Open the live moderation queue", href: "/content-moderation" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => openRoute(item.href, item.hint)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    borderRadius: 14,
                    border: "1px solid transparent",
                    padding: "10px 10px",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--text)",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{item.hint}</div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
