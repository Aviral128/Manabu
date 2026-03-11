"use client";
import React from "react";

import { useAuth } from "../auth/AuthProvider";
import { MarketingNav } from "../components/layout/MarketingNav";
import { MotionIn } from "../components/motion/MotionIn";
import { Badge } from "../components/ui/Badge";
import { Button, ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const highlights = [
  { title: "Adaptive quizzes", body: "Difficulty shifts with your recent answers and confidence." },
  { title: "AI tutor explanations", body: "Miss a concept and get targeted remediation instantly." },
  { title: "Gamified consistency", body: "XP, streaks, and rewards keep momentum visible every day." },
  { title: "Social accountability", body: "Friends, battles, and leaderboards make practice stick." },
];

export default function LandingPage(): JSX.Element {
  const { state } = useAuth();
  const isAdmin = state.status === "auth" && state.role === "admin";

  return (
    <main className="container">
      <MarketingNav />

      <div style={{ marginTop: 22, display: "grid", gap: 14 }}>
        <div className="marketingHero">
          <MotionIn>
            <section
              className="glass"
              style={{
                padding: 24,
                borderRadius: 30,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: -2,
                  background:
                    "radial-gradient(520px 260px at 20% 0%, rgba(56, 189, 248, 0.22), transparent 62%), radial-gradient(440px 220px at 100% 14%, rgba(74, 222, 128, 0.18), transparent 56%)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <Badge tone="info">AI Learning Platform</Badge>
                <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 50, lineHeight: 1.02, margin: "16px 0 0" }}>
                  Build mastery with a learning system that reacts to you.
                </h1>
                <p style={{ color: "var(--muted)", fontSize: 16, marginTop: 12, maxWidth: 760 }}>
                  MANABU blends diagnostics, adaptive practice, AI tutoring, recommendations, and streak-driven momentum so
                  studying feels directed instead of scattered.
                </p>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
                  <ButtonLink href="/signup">Start learning</ButtonLink>
                  <ButtonLink href="/app/dashboard" variant="ghost">
                    Open learner app
                  </ButtonLink>
                  {isAdmin ? (
                    <ButtonLink href="/dev" variant="ghost">
                      Developer portal
                    </ButtonLink>
                  ) : null}
                </div>

                <div className="insightGrid" style={{ marginTop: 20 }}>
                  {[
                    { label: "Practice modes", value: "Quiz + AI + revision" },
                    { label: "Live services", value: "Gateway to AI engine" },
                    { label: "Special subject", value: "MVA Special ready" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        padding: 14,
                        borderRadius: 18,
                        border: "1px solid var(--border)",
                        background: "var(--panelStrong)",
                        boxShadow: "var(--shadowSoft)",
                      }}
                    >
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>{item.label}</div>
                      <div style={{ fontWeight: 900, marginTop: 6 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </MotionIn>

          <MotionIn delay={0.08}>
            <section className="glass" style={{ padding: 22, borderRadius: 30, display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>Learning cockpit</div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 24, marginTop: 6 }}>
                    One daily loop
                  </div>
                </div>
                <Badge tone="success">Ready now</Badge>
              </div>

              {[
                { title: "Warm-up", meta: "Adaptive quiz", note: "Target your weakest concept first." },
                { title: "Deepen", meta: "AI explanation", note: "Get a step-by-step recovery path." },
                { title: "Lock in", meta: "Revision + streak", note: "Finish with repetition and reward." },
              ].map((item, index) => (
                <div
                  key={item.title}
                  style={{
                    padding: 14,
                    borderRadius: 20,
                    border: "1px solid var(--border)",
                    background: index === 1 ? "linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(74, 222, 128, 0.08))" : "rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div style={{ fontWeight: 900 }}>{item.title}</div>
                    <Badge tone="neutral">{item.meta}</Badge>
                  </div>
                  <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>{item.note}</div>
                </div>
              ))}

              <ButtonLink href="/app/quiz/mva-special" variant="ghost" style={{ width: "100%" }}>
                Explore MVA Special
              </ButtonLink>
            </section>
          </MotionIn>
        </div>

        <div className="marketingFeatureGrid">
          {highlights.map((item, index) => (
            <MotionIn key={item.title} delay={0.05 * index}>
              <Card style={{ borderRadius: 24 }}>
                <Badge tone={index === 0 ? "info" : index === 1 ? "success" : index === 2 ? "warning" : "neutral"}>
                  {item.title}
                </Badge>
                <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 14 }}>{item.body}</div>
              </Card>
            </MotionIn>
          ))}
        </div>

        <MotionIn delay={0.12}>
          <Card style={{ borderRadius: 28, padding: 22 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {[
                { title: "Admin dashboard", body: "Moderation, analytics, notifications, AI controls, and service health." },
                { title: "Learner desktop app", body: "Dashboard, quizzes, recommendations, social features, and gamification." },
                {
                  title: "Developer portal",
                  body: isAdmin
                    ? "API explorer, health monitor, logs viewer, AI playground, and DB inspector."
                    : "Admin-only tools are hidden until a verified operator signs in.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    padding: 16,
                    borderRadius: 20,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>{item.title}</div>
                  <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 14 }}>{item.body}</div>
                </div>
              ))}
            </div>
          </Card>
        </MotionIn>
      </div>
    </main>
  );
}
