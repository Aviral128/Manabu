"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

import { normalizeNextTarget } from "../../auth/shared";
import { MarketingNav } from "../../components/layout/MarketingNav";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth/AuthProvider";

export default function SignupPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, state, isReady } = useAuth();
  const sessionChecking = !isReady || state.status === "loading";
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [requiresVerification, setRequiresVerification] = React.useState(true);

  React.useEffect(() => {
    if (!isReady) return;
    if (state.status === "auth") {
      router.replace(normalizeNextTarget(searchParams.get("next"), "/app/dashboard"));
    }
  }, [isReady, router, searchParams, state]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.trim();
    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters long.");
      return;
    }
    if (!normalizedEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    setRequiresVerification(true);
    try {
      const result = await signup(normalizedEmail, password, displayName.trim());
      setSuccess(result.message || "Check your email to verify your account.");
      setRequiresVerification(result.requiresVerification !== false);
      setPassword("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <MarketingNav />
      <div className="authShell">
        <Card className="authCardSmall">
          {state.status === "auth" ? (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 28 }}>You already have a session</div>
              <Alert tone="info" title="Redirecting">
                Your account is already signed in, so we are taking you straight back to the dashboard.
              </Alert>
              <div style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--muted)" }}>
                <Spinner size={18} /> Redirecting to MANABU...
              </div>
            </div>
          ) : (
            <>
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900,
                  margin: 0,
                  fontSize: "clamp(1.7rem, 4vw, 2.4rem)",
                }}
              >
                Create your account
              </h1>
              <p style={{ color: "var(--muted)", marginTop: 8 }}>
                Create your account, then verify your email to unlock password and magic-link login.
              </p>
              {sessionChecking ? (
                <Card style={{ marginTop: 14, borderRadius: 22, padding: 18, background: "rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Spinner size={18} />
                    <div>
                      <div style={{ fontWeight: 900 }}>Checking your saved session</div>
                      <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>
                        We are confirming whether you are already signed in before showing signup actions.
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
              <form onSubmit={onSubmit} style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>Display name</span>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Enter your full name" required />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>Email</span>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="Enter your email" required />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>Password</span>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                required
              />
            </label>

            {error ? (
              <Alert tone="danger" title="Signup issue">
                {error}
              </Alert>
            ) : null}
            {success ? (
              <Alert tone="success" title="Account created">
                {success}
              </Alert>
            ) : null}

            <Button type="submit" variant="primary" disabled={busy} style={{ width: "100%" }}>
              {busy ? <Spinner size={16} /> : null} {busy ? "Signing up..." : "Sign up"}
            </Button>

            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Already have an account? <Link href="/login" style={{ textDecoration: "underline" }}>Login</Link>
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Prefer passwordless? <Link href="/login" style={{ textDecoration: "underline" }}>Send yourself a magic link instead</Link>
            </div>
            {success ? (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                {requiresVerification ? (
                  <>
                    Check your inbox, click the verification link, then return to{" "}
                    <Link href="/login" style={{ textDecoration: "underline" }}>
                      login
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    Your admin account is ready. Go straight to{" "}
                    <Link href="/login" style={{ textDecoration: "underline" }}>
                      login
                    </Link>
                    , or request a magic link.
                  </>
                )}
              </div>
            ) : null}
              </form>
              )}
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
