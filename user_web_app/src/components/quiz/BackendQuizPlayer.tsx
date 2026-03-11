"use client";

import React from "react";

import { MotionIn } from "../motion/MotionIn";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Spinner } from "../ui/Spinner";
import { getQuiz, submitQuizAttempt, type QuizAttemptResult, type QuizDetails } from "../../services/quiz";

type AnswerMap = Record<number, number>;

export function BackendQuizPlayer({ slug }: { slug: string }): JSX.Element {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quiz, setQuiz] = React.useState<QuizDetails | null>(null);
  const [started, setStarted] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<AnswerMap>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<QuizAttemptResult | null>(null);
  const [timeLeft, setTimeLeft] = React.useState(0);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getQuiz(slug);
        if (!alive) return;
        setQuiz(data);
        setTimeLeft(Math.max(8, data.estimatedMinutes) * 60);
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
  }, [slug]);

  React.useEffect(() => {
    if (!started || finished) return;
    const timer = setInterval(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [started, finished]);

  React.useEffect(() => {
    if (!started || finished || timeLeft > 0) return;
    void handleFinish();
  }, [finished, started, timeLeft]);

  const current = quiz?.questions[index] ?? null;
  const answeredCount = Object.keys(answers).length;
  const progress = quiz?.questions.length ? Math.round((answeredCount / quiz.questions.length) * 100) : 0;

  function startQuiz() {
    if (!quiz) return;
    setStarted(true);
    setFinished(false);
    setIndex(0);
    setAnswers({});
    setResult(null);
    setTimeLeft(Math.max(8, quiz.estimatedMinutes) * 60);
  }

  async function handleFinish() {
    if (!quiz) return;
    setFinished(true);
    setSubmitting(true);
    setError(null);
    try {
      const orderedAnswers = quiz.questions.map((_question, idx) => answers[idx] ?? -1);
      const nextResult = await submitQuizAttempt(quiz.id, orderedAnswers);
      setResult(nextResult);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Card style={{ borderRadius: 28 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Spinner size={18} /> Loading quiz...
        </div>
      </Card>
    );
  }

  if (!quiz) {
    return (
      <Card style={{ borderRadius: 28 }}>
        <div style={{ fontWeight: 900 }}>Quiz unavailable</div>
        <div style={{ color: "var(--muted)", marginTop: 8 }}>{error ?? "The quiz could not be loaded."}</div>
      </Card>
    );
  }

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
              <Badge tone={quiz.isSpecial ? "warning" : "info"}>{quiz.title}</Badge>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 34, marginTop: 12 }}>
                {quiz.title}
              </div>
              <div style={{ color: "var(--muted)", marginTop: 10, maxWidth: 720 }}>{quiz.description}</div>
              <div className="insightGrid" style={{ marginTop: 18 }}>
                {[
                  { label: "Questions", value: String(quiz.questionCount) },
                  { label: "Category", value: quiz.category ?? "General" },
                  { label: "Difficulty", value: quiz.difficulty },
                  { label: "Progress", value: `${progress}%` },
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
              <div style={{ fontSize: 12, opacity: 0.72 }}>Session status</div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 24, marginTop: 8 }}>
                {finished ? "Completed" : started ? "In progress" : "Ready"}
              </div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 16, background: "rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 12, opacity: 0.72 }}>Time left</div>
                  <div style={{ fontWeight: 900, marginTop: 6 }}>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                  </div>
                </div>
                <div style={{ padding: 12, borderRadius: 16, background: "rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 12, opacity: 0.72 }}>Answered</div>
                  <div style={{ fontWeight: 900, marginTop: 6 }}>
                    {answeredCount}/{quiz.questionCount}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                {!started ? <Button onClick={startQuiz}>Start quiz</Button> : null}
                {started && !finished ? (
                  <Button variant="ghost" onClick={() => void handleFinish()}>
                    Finish now
                  </Button>
                ) : null}
                {finished ? (
                  <Button variant="ghost" onClick={startQuiz}>
                    Retry
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      </MotionIn>

      {error ? (
        <Card style={{ borderRadius: 22 }}>
          <div style={{ fontWeight: 900 }}>Quiz error</div>
          <div style={{ color: "var(--muted)", marginTop: 8 }}>{error}</div>
        </Card>
      ) : null}

      {!started ? (
        <Card style={{ borderRadius: 24 }}>
          <div style={{ color: "var(--muted)" }}>
            Start when you are ready. Scores, XP, and attempt history are stored on the backend after submission.
          </div>
        </Card>
      ) : null}

      {started && !finished && current ? (
        <Card style={{ borderRadius: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22 }}>
              Question {index + 1} of {quiz.questions.length}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Badge tone="neutral">{current.difficulty}</Badge>
              <Badge tone="info">{quiz.category ?? "General"}</Badge>
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 18, fontWeight: 800, lineHeight: 1.45 }}>{current.prompt}</div>
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {current.options.map((option, optionIndex) => {
              const selected = answers[index] === optionIndex;
              return (
                <button
                  key={`${current.id}_${optionIndex}`}
                  type="button"
                  onClick={() => setAnswers((previous) => ({ ...previous, [index]: optionIndex }))}
                  style={{
                    textAlign: "left",
                    padding: 14,
                    borderRadius: 18,
                    border: `1px solid ${selected ? "rgba(56, 189, 248, 0.35)" : "var(--border)"}`,
                    background: selected
                      ? "linear-gradient(135deg, rgba(56, 189, 248, 0.14), rgba(74, 222, 128, 0.08))"
                      : "rgba(255,255,255,0.04)",
                    color: "var(--text)",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  {String.fromCharCode(65 + optionIndex)}. {option}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <Button variant="ghost" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>
              Prev
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIndex((value) => Math.min(quiz.questions.length - 1, value + 1))}
              disabled={index >= quiz.questions.length - 1}
            >
              Next
            </Button>
          </div>
        </Card>
      ) : null}

      {finished ? (
        <Card style={{ borderRadius: 26 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22 }}>Results</div>
          {submitting ? (
            <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
              <Spinner size={16} /> Calculating and saving your result...
            </div>
          ) : result ? (
            <>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                <Badge tone="info">
                  Score: {result.score}% ({result.correctAnswers}/{result.totalQuestions})
                </Badge>
                <Badge tone="success">XP earned: {result.xpEarned}</Badge>
              </div>
              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                {result.review.slice(0, 10).map((item) => (
                  <div
                    key={item.questionId}
                    style={{
                      padding: 14,
                      borderRadius: 18,
                      border: "1px solid var(--border)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <div style={{ fontWeight: 900 }}>{item.prompt}</div>
                      <Badge tone={item.isCorrect ? "success" : "danger"}>{item.isCorrect ? "Correct" : "Wrong"}</Badge>
                    </div>
                    <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>
                      Your answer: {item.selectedIndex >= 0 ? String.fromCharCode(65 + item.selectedIndex) : "-"}
                    </div>
                    <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>
                      Correct answer: {String.fromCharCode(65 + item.correctIndex)}
                    </div>
                    {item.explanation ? <div style={{ marginTop: 6, fontSize: 13 }}>{item.explanation}</div> : null}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ marginTop: 12, color: "var(--muted)" }}>
              The quiz finished, but the final result could not be retrieved.
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}
