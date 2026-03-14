"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { ArrowRight, KeyRound, MailCheck, Sparkles } from "lucide-react";

import { normalizeNextTarget } from "../../auth/shared";
import { MarketingNav } from "../../components/layout/MarketingNav";
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
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [linkBusy, setLinkBusy] = React.useState(false);
  const [passwordBusy, setPasswordBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

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

  async function onMagicLinkSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setLinkBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await requestMagicLink(email);
      setSuccess(response.message || "Check your inbox for a login link.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLinkBusy(false);
    }
  }

  async function onPasswordButtonClick() {
    if (!email.includes("@")) {
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
      await login(email, password);
      router.push(normalizeNextTarget(searchParams.get("next"), "/app/dashboard"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <main className="container">
      <MarketingNav />
      <div style={{ marginTop: 22, display: "grid", placeItems: "center" }}>
        <Card style={{ width: "min(980px, 100%)", padding: 0, overflow: "hidden", borderRadius: 32 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", minHeight: 620 }}>
            <section
              style={{
                padding: 28,
                background:
                  "radial-gradient(circle at top left, rgba(14, 165, 233, 0.26), transparent 38%), radial-gradient(circle at bottom right, rgba(249, 115, 22, 0.18), transparent 34%)",
                borderRight: "1px solid var(--border)",
                display: "grid",
                alignContent: "space-between",
                gap: 18,
              }}
            >
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
                  <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2.3rem, 4vw, 4rem)", lineHeight: 1.02, margin: 0 }}>
                    Login with one field, not a form maze.
                  </h1>
                  <p style={{ color: "var(--muted)", fontSize: 16, maxWidth: 520, marginTop: 16 }}>
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

            <section style={{ padding: 28, display: "grid", alignContent: "center", gap: 18 }}>
              <div>
                <div style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2 }}>Access MANABU</div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 34, margin: "8px 0 0" }}>Welcome back</h2>
                <p style={{ color: "var(--muted)", marginTop: 10 }}>
                  Use your email to get a login link, or continue with your password if you already have one.
                </p>
              </div>

              {!isReady ? <div style={{ color: "var(--muted)", fontSize: 13 }}>Checking your saved session...</div> : null}

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

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
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
                  <Link href="/reset-password" style={{ color: "var(--muted)", fontWeight: 700, textDecoration: "underline" }}>
                    Forgot Password?
                  </Link>
                </div>

                {showPassword ? (
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
                      {passwordBusy ? <Spinner size={16} /> : <KeyRound size={16} />} Continue with password
                    </Button>
                  </div>
                ) : null}

                {error ? <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div> : null}
                {success ? <div style={{ color: "var(--primary)", fontSize: 13, fontWeight: 700 }}>{success}</div> : null}

                <Button type="submit" disabled={linkBusy} style={{ padding: "14px 16px", borderRadius: 18 }}>
                  {linkBusy ? <Spinner size={16} /> : <MailCheck size={16} />} Send Login Link
                </Button>

                {googleAuthEnabled ? (
                  <Button type="button" variant="ghost" style={{ padding: "14px 16px", borderRadius: 18 }}>
                    Continue with Google <ArrowRight size={16} />
                  </Button>
                ) : (
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: 18,
                      border: "1px dashed var(--border)",
                      color: "var(--muted)",
                      fontSize: 13,
                    }}
                  >
                    Google sign-in is not enabled on this deployment yet. Use a magic link or password login for now.
                  </div>
                )}

                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  New here? Create an account first, verify your email, and then use magic link or password login.{" "}
                  <Link href="/signup" style={{ textDecoration: "underline", fontWeight: 700 }}>
                    Create an account
                  </Link>
                  .
                </div>
              </form>
            </section>
          </div>
        </Card>
      </div>
    </main>
  );
}
