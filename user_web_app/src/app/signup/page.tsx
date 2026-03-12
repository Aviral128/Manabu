"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

import { normalizeNextTarget } from "../../auth/shared";
import { MarketingNav } from "../../components/layout/MarketingNav";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth/AuthProvider";

export default function SignupPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, state, isReady } = useAuth();
  const [displayName, setDisplayName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isReady) return;
    if (state.status === "auth") {
      router.replace(normalizeNextTarget(searchParams.get("next"), "/app/dashboard"));
    }
  }, [isReady, router, searchParams, state]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters long.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signup(email, password, displayName);
      router.push(normalizeNextTarget(searchParams.get("next"), "/app/dashboard"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <MarketingNav />
      <div style={{ marginTop: 18, display: "grid", placeItems: "center" }}>
        <Card style={{ width: "min(560px, 100%)", borderRadius: 28 }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, margin: 0 }}>Create your account</h1>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>
            Start with a baseline, then let MANABU adapt your plan.
          </p>
          {!isReady ? <div style={{ color: "var(--muted)", marginTop: 8, fontSize: 13 }}>Checking your saved session...</div> : null}
          <form onSubmit={onSubmit} style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>Display name</span>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>Email</span>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>Password</span>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>

            {error ? <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div> : null}

            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? <Spinner size={16} /> : null} Sign up
            </Button>

            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Already have an account? <Link href="/login" style={{ textDecoration: "underline" }}>Login</Link>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
