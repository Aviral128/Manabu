"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

import { MarketingNav } from "../../components/layout/MarketingNav";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { requestPasswordReset, resetPassword } from "../../services/auth";

export default function ResetPasswordPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [email, setEmail] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function onRequestReset(event: React.FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await requestPasswordReset(email);
      setSuccess(response.message || "Check your inbox for a reset link.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onResetPassword(event: React.FormEvent) {
    event.preventDefault();
    if (!token) {
      setError("This reset link is invalid.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await resetPassword({ token, newPassword });
      setSuccess(response.message || "Password updated. Redirecting to login...");
      window.setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <MarketingNav />
      <div style={{ marginTop: 24, display: "grid", placeItems: "center" }}>
        <Card style={{ width: "min(560px, 100%)", padding: 26, borderRadius: 30 }}>
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2 }}>
                {token ? "Choose a new password" : "Forgot your password?"}
              </div>
              <h1 style={{ fontFamily: "var(--font-heading)", margin: "8px 0 0" }}>
                {token ? "Reset your password" : "Send a reset link"}
              </h1>
              <p style={{ color: "var(--muted)", marginTop: 10 }}>
                {token
                  ? "Set a new password for your MANABU account."
                  : "Enter your email and we will send you a secure password reset link."}
              </p>
            </div>

            {!token ? (
              <form onSubmit={onRequestReset} style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Email</span>
                  <Input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    style={{ padding: "14px 16px", borderRadius: 18 }}
                  />
                </label>

                {error ? <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div> : null}
                {success ? <div style={{ color: "var(--primary)", fontSize: 13, fontWeight: 700 }}>{success}</div> : null}

                <Button type="submit" disabled={busy} style={{ padding: "14px 16px", borderRadius: 18 }}>
                  {busy ? <Spinner size={16} /> : null} Send reset email
                </Button>
              </form>
            ) : (
              <form onSubmit={onResetPassword} style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>New password</span>
                  <Input
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    style={{ padding: "14px 16px", borderRadius: 18 }}
                  />
                </label>
                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Confirm password</span>
                  <Input
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat your new password"
                    style={{ padding: "14px 16px", borderRadius: 18 }}
                  />
                </label>

                {error ? <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div> : null}
                {success ? <div style={{ color: "var(--primary)", fontSize: 13, fontWeight: 700 }}>{success}</div> : null}

                <Button type="submit" disabled={busy} style={{ padding: "14px 16px", borderRadius: 18 }}>
                  {busy ? <Spinner size={16} /> : null} Reset password
                </Button>
              </form>
            )}

            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Ready to go back?{" "}
              <Link href="/login" style={{ textDecoration: "underline", fontWeight: 700 }}>
                Return to login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
