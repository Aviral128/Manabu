"use client";

import React from "react";

import { MarketingNav } from "../../../components/layout/MarketingNav";
import { ButtonLink } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function MagicMobilePage(): JSX.Element {
  return (
    <main className="container">
      <MarketingNav />
      <div className="authShell">
        <Card className="authCardSmall" style={{ padding: 24 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 26 }}>
              Open the MANABU app and login with your password
            </div>
            <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              For security reasons magic-link login works best in the browser. Please open the app and login using your
              password.
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                "Switch back to the MANABU app.",
                "Tap Login and enter your password.",
                "You’ll land on your dashboard immediately.",
              ].map((step, index) => (
                <div
                  key={step}
                  style={{
                    padding: 12,
                    borderRadius: 16,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.05)",
                    fontWeight: 700,
                  }}
                >
                  {index + 1}. {step}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <ButtonLink href="manabu://login">
                Open MANABU App
              </ButtonLink>
              <ButtonLink href="/login" variant="ghost">
                Return to login page
              </ButtonLink>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
