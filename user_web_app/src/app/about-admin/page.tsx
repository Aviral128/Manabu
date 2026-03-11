import React from "react";

import { MarketingNav } from "../../components/layout/MarketingNav";
import { MotionIn } from "../../components/motion/MotionIn";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";

export default function AboutAdminPage(): JSX.Element {
  return (
    <main className="container">
      <MarketingNav />

      <div style={{ marginTop: 22, display: "grid", gap: 14 }}>
        <MotionIn>
          <Card
            style={{
              borderRadius: 30,
              padding: 24,
              background:
                "radial-gradient(360px 180px at 0% 0%, rgba(56, 189, 248, 0.18), transparent 68%), linear-gradient(135deg, var(--heroSurface), var(--heroSurfaceSoft))",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(260px, 0.95fr)", gap: 16 }}>
              <div style={{ minWidth: 0 }}>
                <Badge tone="info">About Admin</Badge>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 40, marginTop: 14 }}>
                  Aviral Sultaniya
                </div>
                <div style={{ color: "var(--muted)", marginTop: 10, maxWidth: 760, lineHeight: 1.6 }}>
                  Student builder, platform admin, and the person behind this MANABU frontend experience.
                </div>

                <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  {[
                    { label: "Name", value: "Aviral Sultaniya" },
                    { label: "Grade", value: "10th" },
                    { label: "Schooling", value: "Macro Vision Academy, Burhanpur" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        padding: 14,
                        borderRadius: 20,
                        border: "1px solid var(--border)",
                        background: "var(--panelStrong)",
                        boxShadow: "var(--shadowSoft)",
                      }}
                    >
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>{item.label}</div>
                      <div style={{ fontWeight: 900, marginTop: 8 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: 18,
                  borderRadius: 24,
                  background: "rgba(9, 24, 45, 0.95)",
                  color: "#eff7ff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 22,
                      background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(186, 230, 253, 0.84))",
                      display: "grid",
                      placeItems: "center",
                      padding: 10,
                    }}
                  >
                    <img src="/brand/manabu-wordmark.svg" alt="MANABU" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.72 }}>Builder profile</div>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 24, marginTop: 6 }}>
                      Macro Vision Academy
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                  {[
                    "Focused on building MANABU into a modern AI learning experience.",
                    "Combining school knowledge, product design, and platform operations.",
                    "Representing Grade 10 student energy with startup-level ambition.",
                  ].map((line) => (
                    <div
                      key={line}
                      style={{
                        padding: 12,
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.06)",
                        lineHeight: 1.55,
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </MotionIn>
      </div>
    </main>
  );
}
