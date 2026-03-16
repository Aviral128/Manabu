"use client";

import { BookOpen, Flame, LayoutDashboard, Moon, Sun, Swords, Target, UserCircle2, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useTheme } from "next-themes";

import { useAuth } from "../../auth/AuthProvider";
import { clsx } from "../../utils/clsx";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const nav: NavItem[] = [
  { href: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/app/quiz", label: "Quizzes", icon: <BookOpen size={18} /> },
  { href: "/app/learning", label: "Learning", icon: <Target size={18} /> },
  { href: "/app/social", label: "Social", icon: <Swords size={18} /> },
  { href: "/app/recommendations", label: "Recommendations", icon: <BookOpen size={18} /> },
  { href: "/app/gamification", label: "Gamification", icon: <Flame size={18} /> },
  { href: "/about-admin", label: "About Admin", icon: <UserCircle2 size={18} /> },
];

const mobileNav: NavItem[] = [
  { href: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/app/quiz", label: "Quiz", icon: <BookOpen size={18} /> },
  { href: "/app/profile", label: "Profile", icon: <UserCircle2 size={18} /> },
];

export function AppShell({ children }: { children: React.ReactNode }): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { state, logout } = useAuth();
  const { theme, systemTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 900);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (state.status !== "anon") return;
    const next = pathname ? `${pathname}` : "/app/dashboard";
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [pathname, router, state.status]);

  const resolved = theme === "system" ? systemTheme : theme;
  const isDark = mounted && resolved === "dark";
  const navItems = React.useMemo(
    () => (state.status === "auth" && state.role === "admin" ? [...nav, { href: "/dev", label: "Developer", icon: <Wrench size={18} /> }] : nav),
    [state]
  );
  const authAction =
    state.status === "loading" ? (
      <Button variant="ghost" disabled>
        <Spinner size={14} /> Checking session
      </Button>
    ) : state.status === "auth" ? (
      <Button
        variant="ghost"
        onClick={async () => {
          await logout();
          router.push("/");
        }}
      >
        Logout
      </Button>
    ) : (
      <Button variant="ghost" onClick={() => router.push("/login")}>
        Login
      </Button>
    );

  if (isMobile) {
    return (
      <div className="mobileShell">
        <header className="glass mobileTopbar">
          <Link href="/app/dashboard" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(187, 247, 208, 0.86))",
                display: "grid",
                placeItems: "center",
                padding: 6,
              }}
            >
              <Image src="/brand/manabu-wordmark.svg" alt="MANABU" width={34} height={34} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </span>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, letterSpacing: 0.3 }}>MANABU</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                {state.status === "auth" ? state.user.displayName : "Learner app"}
              </div>
            </div>
          </Link>
          <div className="mobileTopbarActions">
            <Button variant="ghost" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Toggle theme">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            {authAction}
          </div>
        </header>

        <main className="mobileMain">{children}</main>

        <nav className="mobileNav">
          {mobileNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={clsx("mobileNavItem", active && "active")}>
                <span className="mobileNavIcon">{item.icon}</span>
                <span className="mobileNavLabel">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className="shellRoot">
      <aside className="shellAside">
        <div
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
                "radial-gradient(220px 120px at 0% 0%, rgba(56, 189, 248, 0.22), transparent 66%), linear-gradient(135deg, rgba(12, 42, 76, 0.98), rgba(11, 18, 31, 0.94))",
              color: "#f3fbff",
            }}
          >
            <Link href="/app/dashboard" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(187, 247, 208, 0.86))",
                display: "grid",
                placeItems: "center",
                padding: 8,
              }}
            >
                <Image src="/brand/manabu-wordmark.svg" alt="MANABU" width={40} height={40} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </span>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, letterSpacing: 0.3 }}>MANABU</div>
                <div style={{ fontSize: 12, opacity: 0.78, marginTop: 2 }}>
                  {state.status === "auth"
                    ? `${state.user.displayName} - ${state.role}`
                    : state.status === "loading"
                      ? "Checking session..."
                      : "Guest mode"}
                </div>
              </div>
            </Link>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              <Badge tone="info">Adaptive</Badge>
              <Badge tone="success">Daily streak</Badge>
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 12, opacity: 0.72 }}>Today's energy</span>
                <span style={{ fontWeight: 800 }}>High</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}>
                <div
                  style={{
                    width: "78%",
                    height: "100%",
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #38bdf8, #4ade80)",
                  }}
                />
              </div>
            </div>
          </div>

          <nav className="appNav" style={{ marginTop: 16 }}>
            {navItems.map((item) => {
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
                      ? "linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(74, 222, 128, 0.08))"
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

          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 18,
              border: "1px solid var(--border)",
              background: "var(--panelStrong)",
            }}
          >
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Quick loop</div>
            <div style={{ marginTop: 8, fontFamily: "var(--font-heading)", fontWeight: 900 }}>Practice, reflect, level up</div>
            <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>
              Hit a quiz, review one weak concept, then collect streak progress before you leave.
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="ghost" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Toggle theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            {authAction}
          </div>
        </div>
      </aside>

      <main className="shellMain">{children}</main>
    </div>
  );
}
