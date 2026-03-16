"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

import { MarketingNav } from "../../../components/layout/MarketingNav";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";
import { Alert } from "../../../components/ui/Alert";
import { verifyEmail, verifyMagicLink } from "../../../services/auth";

export default function VerifyMagicPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const mode = searchParams.get("mode") === "verify-email" ? "verify-email" : "magic-login";
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = React.useState(
    mode === "verify-email" ? "Verifying your email..." : "Verifying your magic link..."
  );
  const [isMobileWebView, setIsMobileWebView] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isAndroid = /Android/i.test(userAgent);
    const isWebView = /\bwv\b/i.test(userAgent) || /Capacitor/i.test(userAgent) || /Android.*Version\/[\d.]+/i.test(userAgent);
    setIsMobileWebView(isAndroid && isWebView);
  }, []);

  React.useEffect(() => {
    if (isMobileWebView === null) return;
    let active = true;
    let redirectTimer: number | undefined;

    (async () => {
      if (!token) {
        if (!active) return;
        setStatus("error");
        setMessage(mode === "verify-email" ? "This verification link is missing or invalid." : "This login link is missing or invalid.");
        return;
      }

      try {
        if (!active) return;
        if (mode === "verify-email") {
          const result = await verifyEmail(token);
          if (!active) return;
          setStatus("success");
          setMessage(result.message || "Email verified. You can log in now.");
          redirectTimer = window.setTimeout(() => {
            router.replace("/login?verified=1");
          }, 900);
          return;
        }

        const result = await verifyMagicLink(token);
        if (!active) return;

        if (isMobileWebView) {
          setStatus("success");
          setMessage("Magic link verified. Open the MANABU app and log in with your password.");
          redirectTimer = window.setTimeout(() => {
            router.replace("/auth/magic-mobile");
          }, 900);
          return;
        }

        window.localStorage.setItem("manabu_access_token", result.token);
        window.localStorage.setItem("manabu_user", JSON.stringify(result.user));
        setStatus("success");
        setMessage("Login successful. Redirecting to your dashboard...");
        redirectTimer = window.setTimeout(() => {
          router.replace("/app/dashboard");
        }, 700);
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage((error as Error).message);
      }
    })();

    return () => {
      active = false;
      if (redirectTimer) {
        window.clearTimeout(redirectTimer);
      }
    };
  }, [isMobileWebView, mode, router, token]);

  return (
    <main className="container">
      <MarketingNav />
      <div style={{ marginTop: 24, display: "grid", placeItems: "center" }}>
        <Card style={{ width: "min(540px, 100%)", padding: 28, borderRadius: 28 }}>
          <div style={{ display: "grid", gap: 16, textAlign: "center" }}>
            <div style={{ display: "grid", placeItems: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(34, 197, 94, 0.2))",
                }}
              >
                {status === "loading" ? <Spinner size={28} /> : <div style={{ fontSize: 28 }}>{status === "success" ? "✓" : "!"}</div>}
              </div>
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-heading)", margin: 0 }}>
                {mode === "verify-email" ? "Verifying your email" : "Verifying your login"}
              </h1>
              <div style={{ marginTop: 14 }}>
                <Alert
                  tone={status === "error" ? "danger" : status === "success" ? "success" : "info"}
                  title={status === "error" ? "Verification issue" : status === "success" ? "Success" : "Working"}
                >
                  {message}
                </Alert>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
