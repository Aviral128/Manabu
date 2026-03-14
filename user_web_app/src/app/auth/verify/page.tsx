"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

import { MarketingNav } from "../../../components/layout/MarketingNav";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";
import { verifyMagicLink } from "../../../services/auth";

export default function VerifyMagicPage(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = React.useState("Verifying your magic link...");

  React.useEffect(() => {
    let active = true;

    (async () => {
      if (!token) {
        if (!active) return;
        setStatus("error");
        setMessage("This login link is missing or invalid.");
        return;
      }

      try {
        const result = await verifyMagicLink(token);
        if (!active) return;

        window.localStorage.setItem("manabu_access_token", result.token);
        window.localStorage.setItem("manabu_user", JSON.stringify(result.user));
        setStatus("success");
        setMessage("Login successful. Redirecting to your dashboard...");
        window.setTimeout(() => {
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
    };
  }, [router, token]);

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
                <Spinner size={28} />
              </div>
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-heading)", margin: 0 }}>Verifying your login</h1>
              <p style={{ color: status === "error" ? "var(--danger)" : "var(--muted)", marginTop: 10 }}>{message}</p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
