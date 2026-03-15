"use client";
import React from "react";

import { useAuth } from "../auth/AuthProvider";
import { MarketingNav } from "../components/layout/MarketingNav";
import { BrandLaunchOverlay } from "../components/marketing/BrandLaunchOverlay";
import { MotionIn } from "../components/motion/MotionIn";
import { Badge } from "../components/ui/Badge";
import { ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const highlights = [
  { title: "Adaptive quizzes", body: "Difficulty shifts with your recent answers and confidence." },
  { title: "AI tutor explanations", body: "Miss a concept and get targeted remediation instantly." },
  { title: "Gamified consistency", body: "XP, streaks, and rewards keep momentum visible every day." },
  { title: "Social accountability", body: "Friends, battles, and leaderboards make practice stick." },
];

const launchMetrics = [
  { label: "Launch mode", value: "Cinematic intro" },
  { label: "Study engine", value: "Adaptive + AI" },
  { label: "Cross-device", value: "Web + mobile aligned" },
];

const flowSteps = [
  { title: "Scan the signal", meta: "Diagnostics", note: "The system maps weak spots before your attention drifts." },
  { title: "Push the session", meta: "Adaptive quiz", note: "Question flow changes as your confidence and accuracy move." },
  { title: "Lock in momentum", meta: "AI + streak", note: "Explanations, revision, and visible progress finish the loop." },
];

export default function LandingPage(): JSX.Element {
  const { state } = useAuth();
  const isAdmin = state.status === "auth" && state.role === "admin";
  const dashboardHref = state.status === "auth" ? "/app/dashboard" : "/login?next=/app/dashboard";
  const mvaSpecialHref = state.status === "auth" ? "/app/quiz/mva-special" : "/login?next=/app/quiz/mva-special";

  return (
    <main className="container">
      <BrandLaunchOverlay />
      <MarketingNav />

      <div style={{ marginTop: 22, display: "grid", gap: 14 }}>
        <div className="marketingHero">
          <MotionIn>
            <section
              className="glass"
              style={{
                padding: 0,
                borderRadius: 34,
                position: "relative",
                overflow: "hidden",
                background:
                  "linear-gradient(145deg, rgba(5, 13, 24, 0.98), rgba(10, 22, 40, 0.92) 40%, rgba(14, 31, 54, 0.9) 72%, rgba(7, 16, 29, 0.96))",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: -2,
                  background:
                    "radial-gradient(560px 300px at 12% 4%, rgba(73, 183, 255, 0.24), transparent 56%), radial-gradient(400px 220px at 92% 14%, rgba(103, 232, 249, 0.16), transparent 52%), radial-gradient(360px 240px at 78% 86%, rgba(253, 186, 77, 0.14), transparent 56%)",
                  pointerEvents: "none",
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                  backgroundSize: "44px 44px",
                  opacity: 0.24,
                  maskImage: "radial-gradient(circle at center, black 42%, transparent 88%)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    display: "grid",
                    gap: 22,
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    padding: 26,
                  }}
                >
                  <div style={{ display: "grid", alignContent: "space-between", gap: 22 }}>
                    <div>
                      <Badge tone="info">Cinematic adaptive learning</Badge>
                      <h1
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 900,
                          fontSize: "clamp(2.6rem, 6vw, 4.3rem)",
                          lineHeight: 0.98,
                          margin: "16px 0 0",
                          color: "#eef6ff",
                          maxWidth: 640,
                        }}
                      >
                        Launch into focused study with a homepage that actually feels alive.
                      </h1>
                      <p style={{ color: "#bcd2ea", fontSize: 16, marginTop: 14, maxWidth: 660, lineHeight: 1.65 }}>
                        Inspired by high-energy event sites, MANABU now opens with a full-screen motion sequence and lands in a
                        product hero built around adaptive practice, AI tutoring, and streak-driven momentum.
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <ButtonLink href="/login">Enter MANABU</ButtonLink>
                      <ButtonLink href={dashboardHref} variant="ghost">
                        Open learner app
                      </ButtonLink>
                      {isAdmin ? (
                        <ButtonLink href="/dev" variant="ghost">
                          Developer portal
                        </ButtonLink>
                      ) : null}
                    </div>

                    <div className="insightGrid">
                      {launchMetrics.map((item) => (
                        <div
                          key={item.label}
                          style={{
                            padding: 14,
                            borderRadius: 18,
                            border: "1px solid rgba(232, 243, 255, 0.12)",
                            background: "rgba(255,255,255,0.06)",
                            boxShadow: "0 18px 48px rgba(2, 9, 18, 0.22)",
                          }}
                        >
                          <div style={{ color: "#89a6c9", fontSize: 12 }}>{item.label}</div>
                          <div style={{ fontWeight: 900, marginTop: 6, color: "#eef6ff" }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      position: "relative",
                      minHeight: 360,
                      borderRadius: 28,
                      border: "1px solid rgba(232, 243, 255, 0.12)",
                      background: "linear-gradient(145deg, rgba(7, 17, 31, 0.86), rgba(15, 33, 57, 0.74))",
                      overflow: "hidden",
                      padding: 20,
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "radial-gradient(circle at 50% 42%, rgba(73, 183, 255, 0.18), transparent 34%), linear-gradient(180deg, rgba(73, 183, 255, 0.05), transparent 24%)",
                      }}
                    />
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        width: 250,
                        height: 250,
                        borderRadius: "50%",
                        border: "1px solid rgba(73, 183, 255, 0.18)",
                        top: 34,
                        left: "50%",
                        transform: "translateX(-50%)",
                        boxShadow: "0 0 0 32px rgba(73, 183, 255, 0.04), 0 0 0 68px rgba(103, 232, 249, 0.03)",
                      }}
                    />
                    <div style={{ position: "relative", display: "grid", gap: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <Badge tone="success">Launch loop</Badge>
                        <div style={{ color: "#89a6c9", fontSize: 13, fontWeight: 700 }}>Web and mobile aligned</div>
                      </div>
                      <div style={{ display: "grid", gap: 12, marginTop: 120 }}>
                        {flowSteps.map((item, index) => (
                          <div
                            key={item.title}
                            style={{
                              padding: 14,
                              borderRadius: 18,
                              border: "1px solid rgba(232, 243, 255, 0.12)",
                              background:
                                index === 1
                                  ? "linear-gradient(135deg, rgba(73, 183, 255, 0.16), rgba(103, 232, 249, 0.08))"
                                  : "rgba(255,255,255,0.05)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                              <div style={{ fontWeight: 900, color: "#eef6ff" }}>{item.title}</div>
                              <Badge tone="neutral">{item.meta}</Badge>
                            </div>
                            <div style={{ color: "#bcd2ea", marginTop: 8, fontSize: 13, lineHeight: 1.55 }}>{item.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </MotionIn>

          <MotionIn delay={0.08}>
            <section
              className="glass"
              style={{
                padding: 22,
                borderRadius: 30,
                display: "grid",
                gap: 12,
                background: "linear-gradient(180deg, rgba(9, 18, 36, 0.92), rgba(12, 22, 40, 0.88))",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "#89a6c9", fontSize: 12 }}>Learning cockpit</div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 24, marginTop: 6, color: "#eef6ff" }}>
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
                    border: "1px solid rgba(232, 243, 255, 0.12)",
                    background:
                      index === 1
                        ? "linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(74, 222, 128, 0.08))"
                        : "rgba(255,255,255,0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div style={{ fontWeight: 900, color: "#eef6ff" }}>{item.title}</div>
                    <Badge tone="neutral">{item.meta}</Badge>
                  </div>
                  <div style={{ color: "#bcd2ea", marginTop: 6, fontSize: 13 }}>{item.note}</div>
                </div>
              ))}

              <ButtonLink href={mvaSpecialHref} variant="ghost" style={{ width: "100%" }}>
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
