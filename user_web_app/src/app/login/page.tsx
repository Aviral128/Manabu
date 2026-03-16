"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { KeyRound, MailCheck, Sparkles } from "lucide-react";

import { normalizeNextTarget } from "../../auth/shared";
import { MarketingNav } from "../../components/layout/MarketingNav";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth/AuthProvider";
import { requestMagicLink } from "../../services/auth";

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, state, isReady } = useAuth();
  const sessionChecking = !isReady || state.status === "loading";
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [linkBusy, setLinkBusy] = React.useState(false);
  const [passwordBusy, setPasswordBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (!isReady) return;
    if (state.status === "auth") {
      router.replace(normalizeNextTarget(searchParams.get("next"), "/app/dashboard"));
    }
  }, [isReady, router, searchParams, state]);

  React.useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setSuccess("Email verified. You can log in now.");
      setError(null);
    }
  }, [searchParams]);

  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 760);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function onMagicLinkSubmit(event: React.FormEvent) {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setLinkBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await requestMagicLink(normalizedEmail);
      setSuccess(response.message || "Check your inbox for a login link.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLinkBusy(false);
    }
  }

  async function onPasswordButtonClick() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setPasswordBusy(true);
    setError(null);
    setSuccess(null);

    try {
      await login(normalizedEmail, password);
      router.push(normalizeNextTarget(searchParams.get("next"), "/app/dashboard"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPasswordBusy(false);
    }
  }

  const passwordVisible = isMobile || showPassword;

  return (
    <main className="container">
      <MarketingNav />
      <div className="authShell">
        <Card className="authCard" style={{ padding: 0 }}>
          {state.status === "auth" ? (
            <div style={{ padding: 28, display: "grid", gap: 14 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 900 }}>Redirecting to your dashboard</div>
              <Alert tone="info" title="You are already signed in">
                We detected an active MANABU session and are sending you back to the app now.
              </Alert>
              <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--muted)" }}>
                <Spinner size={18} /> Routing you to your saved destination...
              </div>
            </div>
          ) : (
          <div className="authSplit">
            <section className="authHeroPanel">
              <div style={{ display: "grid", gap: 18 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.16)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    width: "fit-content",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  <Sparkles size={16} /> Passwordless by default
                </div>
                <div>
                  <h1 className="authTitle">Login with one field, not a form maze.</h1>
                  <p className="authSubtitle">
                    Enter your email, open the magic link, and you are in. If you prefer a password, you can still use one.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {[
                  { icon: <MailCheck size={18} />, title: "Check your inbox", body: "We send a single-use login link that expires in 10 minutes." },
                  { icon: <KeyRound size={18} />, title: "Keep passwords optional", body: "Use password login only when you want it. Magic link is the default." },
                ].map((item) => (
                  <div
                    key={item.title}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px minmax(0, 1fr)",
                      gap: 12,
                      padding: 14,
                      borderRadius: 20,
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.18)",
                    }}
                  >
                    <div style={{ display: "grid", placeItems: "center", borderRadius: 14, background: "rgba(255,255,255,0.18)" }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight: 800 }}>{item.title}</div>
                      <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{item.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="authFormPanel">
              <div>
                <div style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2 }}>Access MANABU</div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 34, margin: "8px 0 0" }}>Welcome back</h2>
                <p style={{ color: "var(--muted)", marginTop: 10 }}>
                  Use your email to get a login link, or continue with your password if you already have one.
                </p>
              </div>

              {sessionChecking ? (
                <Card style={{ borderRadius: 24, padding: 18, background: "rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Spinner size={18} />
                    <div>
                      <div style={{ fontWeight: 900 }}>Checking your saved session</div>
                      <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>
                        Making sure you see the right auth state before we show the login actions.
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
              <form onSubmit={onMagicLinkSubmit} style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Email</span>
                  <Input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    required
                    style={{ padding: "14px 16px", fontSize: 16, borderRadius: 18 }}
                  />
                </label>

                {isMobile ? (
                  <Alert tone="info" title="Mobile tip">
                    Magic link works best on desktop. For the mobile app, login using your password.
                  </Alert>
                ) : null}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  {!isMobile ? (
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => {
                          setError(null);
                          setSuccess(null);
                          return !current;
                        })
                      }
                      style={{ background: "none", border: 0, padding: 0, color: "var(--muted)", cursor: "pointer", fontWeight: 700 }}
                    >
                      {showPassword ? "Hide password login" : "Use password instead"}
                    </button>
                  ) : (
                    <div style={{ color: "var(--muted)", fontWeight: 700 }}>Password login recommended on mobile</div>
                  )}
                  <Link href="/reset-password" style={{ color: "var(--muted)", fontWeight: 700, textDecoration: "underline" }}>
                    Forgot Password?
                  </Link>
                </div>

                {passwordVisible ? (
                  <div style={{ display: "grid", gap: 10, padding: 14, borderRadius: 20, border: "1px solid var(--border)", background: "rgba(255,255,255,0.05)" }}>
                    <label style={{ display: "grid", gap: 8 }}>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>Password</span>
                      <Input
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        style={{ padding: "12px 14px", borderRadius: 16 }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          if (!passwordBusy) {
                            void onPasswordButtonClick();
                          }
                        }}
                      />
                    </label>
                    <Button type="button" variant="ghost" disabled={passwordBusy} onClick={onPasswordButtonClick}>
                      {passwordBusy ? <Spinner size={16} /> : <KeyRound size={16} />} {passwordBusy ? "Signing in..." : "Continue with password"}
                    </Button>
                  </div>
                ) : null}

                {error ? (
                  <Alert tone="danger" title="Login issue">
                    {error}
                  </Alert>
                ) : null}
                {success ? (
                  <Alert tone="success" title="Check your inbox">
                    {success}
                  </Alert>
                ) : null}

                <Button type="submit" disabled={linkBusy} style={{ padding: "14px 16px", borderRadius: 18, width: "100%" }}>
                  {linkBusy ? <Spinner size={16} /> : <MailCheck size={16} />} {linkBusy ? "Sending login link..." : "Send Login Link"}
                </Button>

                <div style={{ display: "grid", gap: 8 }}>
                  <Button type="button" variant="ghost" style={{ padding: "14px 16px", borderRadius: 18 }} disabled>
                    Google login coming soon
                  </Button>
                  <div className="authHint">
                    Use a magic link or password login for now. Google sign-in is not available on this deployment yet.
                  </div>
                </div>

                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  New here? Create an account first, verify your email, and then use magic link or password login.{" "}
                  <Link href="/signup" style={{ textDecoration: "underline", fontWeight: 700 }}>
                    Create an account
                  </Link>
                  .
                </div>
              </form>
              )}
            </section>
          </div>
          )}
        </Card>
      </div>
    </main>
  );
}
