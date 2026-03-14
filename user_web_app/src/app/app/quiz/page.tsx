"use client";
import React from "react";

import { MotionIn } from "../../../components/motion/MotionIn";
import { Badge } from "../../../components/ui/Badge";
import { Button, ButtonLink } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";
import { listQuizzes, type QuizSummary } from "../../../services/quiz";

export default function QuizHubPage(): JSX.Element {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quizzes, setQuizzes] = React.useState<QuizSummary[]>([]);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listQuizzes();
        if (!alive) return;
        setQuizzes(data);
      } catch (nextError) {
        if (!alive) return;
        setError((nextError as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const featured = quizzes.find((quiz) => quiz.slug === "mva-special") ?? quizzes[0] ?? null;

  return (
    <div style={{ display: "grid", gap: 12, paddingTop: 2 }}>
      <MotionIn>
        <Card
          style={{
            borderRadius: 30,
            padding: 22,
            background:
              "radial-gradient(320px 180px at 0% 0%, rgba(56, 189, 248, 0.18), transparent 70%), linear-gradient(135deg, var(--heroSurface), var(--heroSurfaceSoft))",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(260px, 0.85fr)", gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <Badge tone="info">Quiz arena</Badge>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 34, marginTop: 12 }}>
                Choose a practice mode backed by the real MANABU quiz engine.
              </div>
              <div style={{ color: "var(--muted)", marginTop: 10, maxWidth: 720 }}>
                Question banks, scoring, XP, and attempt history now come from the shared backend API. Open any subject,
                choose exactly how many questions you want, and set your own timer before you start.
              </div>
              <div className="insightGrid" style={{ marginTop: 18 }}>
                {[
                  { label: "Live quizzes", value: loading ? "..." : String(quizzes.length) },
                  { label: "Special mode", value: featured?.title ?? "Loading" },
                  { label: "Storage", value: "PostgreSQL + Prisma" },
                  { label: "Scoring", value: "Backend graded" },
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
                    <div style={{ fontWeight: 900, marginTop: 6 }}>{item.value}</div>
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
              <div style={{ fontSize: 12, opacity: 0.72 }}>Featured quiz</div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 24, marginTop: 8 }}>
                {featured?.title ?? "Preparing catalog"}
              </div>
              <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.5, opacity: 0.82 }}>
                {featured?.description ?? "Loading the latest question banks from the shared backend."}
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {featured ? (
                  <ButtonLink href={`/app/quiz/${featured.slug}`}>Customize {featured.title}</ButtonLink>
                ) : (
                  <Button disabled>{loading ? "Loading..." : "Unavailable"}</Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </MotionIn>

      {error ? (
        <Card style={{ borderRadius: 24 }}>
          <div style={{ fontWeight: 900 }}>Quiz catalog unavailable</div>
          <div style={{ color: "var(--muted)", marginTop: 8 }}>{error}</div>
        </Card>
      ) : null}

      {loading ? (
        <Card style={{ borderRadius: 24 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Spinner size={16} /> Loading quizzes...
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {quizzes.map((quiz, index) => (
            <MotionIn key={quiz.id} delay={0.04 + index * 0.01}>
              <Card style={{ borderRadius: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <Badge tone={quiz.isSpecial ? "warning" : "info"}>{quiz.title}</Badge>
                  <Badge tone="neutral">{quiz.questionCount} questions</Badge>
                </div>
                <div style={{ color: "var(--muted)", marginTop: 10 }}>{quiz.description}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                  <Badge tone="success">Easy {quiz.difficultyCounts.easy}</Badge>
                  <Badge tone="info">Medium {quiz.difficultyCounts.medium}</Badge>
                  <Badge tone="warning">Hard {quiz.difficultyCounts.hard}</Badge>
                </div>
                <div style={{ color: "var(--muted)", marginTop: 10, fontSize: 13 }}>
                  Build your own session with a custom question count and timer for this subject.
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                  <ButtonLink href={`/app/quiz/${quiz.slug}`}>Customize and start</ButtonLink>
                  <Badge tone="neutral">{quiz.category ?? "General"}</Badge>
                </div>
              </Card>
            </MotionIn>
          ))}
        </div>
      )}
    </div>
  );
}
