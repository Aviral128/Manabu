"use client";

import React from "react";

import { getQuiz, submitQuizAttempt, type QuizAttemptResult, type QuizDetails } from "../../services/quiz";
import { MotionIn } from "../motion/MotionIn";
import { Alert } from "../ui/Alert";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { SkeletonBlock } from "../ui/SkeletonBlock";
import { Spinner } from "../ui/Spinner";

type AnswerMap = Record<number, number>;
type SessionQuestion = QuizDetails["questions"][number];
type PersistedQuizSession = {
  quizId: string;
  index: number;
  answers: AnswerMap;
  questionCount: number;
  timeLimitMinutes: number;
  sessionQuestions: SessionQuestion[];
  expiresAt: number;
  finished: boolean;
};

const MIN_TIME_LIMIT_MINUTES = 5;
const MAX_TIME_LIMIT_MINUTES = 120;
const QUIZ_SESSION_KEY_PREFIX = "manabu_quiz_session_v1";
const QUIZ_HISTORY_KEY_PREFIX = "manabu_quiz_history_v1";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDefaultQuestionCount(totalQuestions: number) {
  if (totalQuestions <= 20) return totalQuestions;
  return 20;
}

function getRecommendedTimeLimit(questionCount: number) {
  return clamp(Math.max(8, Math.round(questionCount * 1.25)), MIN_TIME_LIMIT_MINUTES, MAX_TIME_LIMIT_MINUTES);
}

function shuffleQuestions(questions: SessionQuestion[]) {
  const copy = [...questions];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  }
  return copy;
}

function dedupeQuestions(questions: SessionQuestion[]) {
  const seenIds = new Set<string>();
  return questions.filter((question) => {
    if (seenIds.has(question.id)) return false;
    seenIds.add(question.id);
    return true;
  });
}

function buildSessionQuestions(questions: SessionQuestion[], count: number, seenQuestionIds: string[]) {
  const uniqueQuestions = dedupeQuestions(questions);
  if (!uniqueQuestions.length) {
    return { sessionQuestions: [] as SessionQuestion[], nextSeenQuestionIds: [] as string[] };
  }

  const validQuestionIds = new Set(uniqueQuestions.map((question) => question.id));
  const normalizedSeenQuestionIds = Array.from(
    new Set(seenQuestionIds.filter((questionId) => validQuestionIds.has(questionId))),
  );
  const activeSeenQuestionIds =
    normalizedSeenQuestionIds.length >= uniqueQuestions.length ? [] : normalizedSeenQuestionIds;

  if (count >= uniqueQuestions.length) {
    return {
      sessionQuestions: shuffleQuestions(uniqueQuestions),
      nextSeenQuestionIds: uniqueQuestions.map((question) => question.id),
    };
  }

  const seenQuestionSet = new Set(activeSeenQuestionIds);
  const unseenQuestions = uniqueQuestions.filter((question) => !seenQuestionSet.has(question.id));
  const sessionQuestions =
    unseenQuestions.length >= count
      ? shuffleQuestions(unseenQuestions).slice(0, count)
      : [
          ...shuffleQuestions(unseenQuestions),
          ...shuffleQuestions(uniqueQuestions.filter((question) => seenQuestionSet.has(question.id))).slice(
            0,
            count - unseenQuestions.length,
          ),
        ];

  return {
    sessionQuestions,
    nextSeenQuestionIds: Array.from(
      new Set([...activeSeenQuestionIds, ...sessionQuestions.map((question) => question.id)]),
    ),
  };
}

function getQuizSessionStorageKey(slug: string) {
  return `${QUIZ_SESSION_KEY_PREFIX}:${slug}`;
}

function getQuizHistoryStorageKey(slug: string) {
  return `${QUIZ_HISTORY_KEY_PREFIX}:${slug}`;
}

function clearStoredQuizSession(slug: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(getQuizSessionStorageKey(slug));
}

function clearSeenQuestionHistory(slug: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getQuizHistoryStorageKey(slug));
}

function readSeenQuestionHistory(slug: string, quiz: QuizDetails) {
  if (typeof window === "undefined") return [] as string[];

  try {
    const raw = window.localStorage.getItem(getQuizHistoryStorageKey(slug));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as { quizId?: string; questionIds?: string[] } | string[];
    const questionIds = Array.isArray(parsed)
      ? parsed
      : parsed.quizId === quiz.id && Array.isArray(parsed.questionIds)
        ? parsed.questionIds
        : [];
    const validQuestionIds = new Set(quiz.questions.map((question) => question.id));
    return Array.from(new Set(questionIds.filter((questionId): questionId is string => validQuestionIds.has(questionId))));
  } catch {
    return [];
  }
}

function persistSeenQuestionHistory(slug: string, quizId: string, questionIds: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getQuizHistoryStorageKey(slug), JSON.stringify({ quizId, questionIds }));
}

function readStoredQuizSession(slug: string, quiz: QuizDetails): PersistedQuizSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(getQuizSessionStorageKey(slug));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedQuizSession>;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.quizId !== quiz.id) return null;
    if (!Array.isArray(parsed.sessionQuestions) || !parsed.sessionQuestions.length) return null;
    if (typeof parsed.expiresAt !== "number" || !Number.isFinite(parsed.expiresAt)) return null;
    if (typeof parsed.questionCount !== "number" || typeof parsed.timeLimitMinutes !== "number") return null;

    const questionMap = new Map(quiz.questions.map((question) => [question.id, question]));
    const sessionQuestions = parsed.sessionQuestions
      .map((question) => questionMap.get(question.id))
      .filter((question): question is SessionQuestion => Boolean(question));

    if (!sessionQuestions.length || sessionQuestions.length !== parsed.sessionQuestions.length) {
      return null;
    }

    const answers =
      parsed.answers && typeof parsed.answers === "object"
        ? Object.fromEntries(
            Object.entries(parsed.answers).filter((entry): entry is [string, number] => typeof entry[1] === "number"),
          )
        : {};

    return {
      quizId: parsed.quizId,
      index: typeof parsed.index === "number" ? parsed.index : 0,
      answers,
      questionCount: parsed.questionCount,
      timeLimitMinutes: parsed.timeLimitMinutes,
      sessionQuestions,
      expiresAt: parsed.expiresAt,
      finished: parsed.finished === true,
    };
  } catch {
    return null;
  }
}

function persistQuizSession(slug: string, session: PersistedQuizSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(getQuizSessionStorageKey(slug), JSON.stringify(session));
}

export function BackendQuizPlayer({ slug }: { slug: string }): JSX.Element {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quiz, setQuiz] = React.useState<QuizDetails | null>(null);
  const [started, setStarted] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<AnswerMap>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [preparingSession, setPreparingSession] = React.useState(false);
  const [result, setResult] = React.useState<QuizAttemptResult | null>(null);
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [questionCount, setQuestionCount] = React.useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = React.useState(15);
  const [sessionQuestions, setSessionQuestions] = React.useState<SessionQuestion[]>([]);
  const [sessionExpiresAt, setSessionExpiresAt] = React.useState<number | null>(null);
  const [seenQuestionHistoryCount, setSeenQuestionHistoryCount] = React.useState(0);
  const [historyNotice, setHistoryNotice] = React.useState<string | null>(null);
  const submitLockRef = React.useRef(false);
  const prepareLockRef = React.useRef(false);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getQuiz(slug);
        if (!alive) return;

        const restored = readStoredQuizSession(slug, data);
        const seenQuestionIds = readSeenQuestionHistory(slug, data);
        const defaultQuestionCount = getDefaultQuestionCount(data.questionCount);
        const defaultTimeLimit = getRecommendedTimeLimit(defaultQuestionCount);

        setQuiz(data);
        setQuestionCount(restored?.questionCount ?? defaultQuestionCount);
        setTimeLimitMinutes(restored?.timeLimitMinutes ?? defaultTimeLimit);
        setSessionQuestions(restored?.sessionQuestions ?? []);
        setStarted(Boolean(restored));
        setFinished(restored?.finished ?? false);
        setIndex(restored ? clamp(restored.index, 0, Math.max(restored.sessionQuestions.length - 1, 0)) : 0);
        setAnswers(restored?.answers ?? {});
        setResult(null);
        setSessionExpiresAt(restored?.expiresAt ?? null);
        setSeenQuestionHistoryCount(seenQuestionIds.length);
        setHistoryNotice(null);
        setTimeLeft(
          restored?.expiresAt
            ? Math.max(0, Math.ceil((restored.expiresAt - Date.now()) / 1000))
            : defaultTimeLimit * 60,
        );
        setPreparingSession(false);
        setSubmitting(false);
        prepareLockRef.current = false;
        submitLockRef.current = false;
      } catch (nextError) {
        if (!alive) return;
        clearStoredQuizSession(slug);
        setSeenQuestionHistoryCount(0);
        setHistoryNotice(null);
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
    if (!started || finished || !sessionExpiresAt) return;

    const syncTime = () => {
      setTimeLeft(Math.max(0, Math.ceil((sessionExpiresAt - Date.now()) / 1000)));
    };

    syncTime();
    const timer = window.setInterval(syncTime, 1000);
    return () => window.clearInterval(timer);
  }, [finished, sessionExpiresAt, started]);

  const activeQuestions = sessionQuestions;
  const maxQuestions = quiz?.questionCount ?? 1;
  const minQuestions = quiz ? Math.min(5, quiz.questionCount) : 1;
  const safeQuestionCount = quiz ? clamp(questionCount, minQuestions, maxQuestions) : questionCount;
  const safeTimeLimitMinutes = clamp(timeLimitMinutes, MIN_TIME_LIMIT_MINUTES, MAX_TIME_LIMIT_MINUTES);
  const recommendedTimeLimit = getRecommendedTimeLimit(safeQuestionCount);
  const answeredCount = Object.keys(answers).length;
  const sessionTotal = activeQuestions.length || safeQuestionCount;
  const progress = sessionTotal ? Math.round((answeredCount / sessionTotal) * 100) : 0;
  const current = activeQuestions[index] ?? null;
  const currentAnswerSelected = answers[index] !== undefined;

  React.useEffect(() => {
    if (!quiz || !started || !sessionQuestions.length || !sessionExpiresAt) {
      clearStoredQuizSession(slug);
      return;
    }

    if (finished && result) {
      clearStoredQuizSession(slug);
      return;
    }

    persistQuizSession(slug, {
      quizId: quiz.id,
      index,
      answers,
      questionCount: safeQuestionCount,
      timeLimitMinutes: safeTimeLimitMinutes,
      sessionQuestions,
      expiresAt: sessionExpiresAt,
      finished,
    });
  }, [
    answers,
    finished,
    index,
    quiz,
    result,
    safeQuestionCount,
    safeTimeLimitMinutes,
    sessionExpiresAt,
    sessionQuestions,
    slug,
    started,
  ]);

  React.useEffect(() => {
    if (!started || finished || timeLeft > 0) return;
    void handleFinish();
  }, [finished, started, timeLeft]);

  function resetToSetup() {
    setStarted(false);
    setFinished(false);
    setIndex(0);
    setAnswers({});
    setResult(null);
    setError(null);
    setSessionQuestions([]);
    setSessionExpiresAt(null);
    setTimeLeft(safeTimeLimitMinutes * 60);
    setPreparingSession(false);
    setSubmitting(false);
    prepareLockRef.current = false;
    submitLockRef.current = false;
    clearStoredQuizSession(slug);
  }

  function handleResetQuestionHistory() {
    clearSeenQuestionHistory(slug);
    setSeenQuestionHistoryCount(0);
    setHistoryNotice("Question rotation reset. Your next session can start fresh.");
  }

  function updateQuestionCount(value: number) {
    if (!quiz) return;
    setQuestionCount(clamp(value, minQuestions, quiz.questionCount));
  }

  function updateTimeLimit(value: number) {
    setTimeLimitMinutes(clamp(value, MIN_TIME_LIMIT_MINUTES, MAX_TIME_LIMIT_MINUTES));
  }

  async function startQuiz() {
    if (!quiz || preparingSession || prepareLockRef.current) return;

    prepareLockRef.current = true;
    setPreparingSession(true);
    setError(null);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 180));

      const seenQuestionIds = readSeenQuestionHistory(slug, quiz);
      const { sessionQuestions: nextSessionQuestions, nextSeenQuestionIds } = buildSessionQuestions(
        quiz.questions,
        safeQuestionCount,
        seenQuestionIds,
      );
      if (!nextSessionQuestions.length) {
        setError("This subject does not have enough questions to build a session right now.");
        return;
      }

      const expiresAt = Date.now() + safeTimeLimitMinutes * 60_000;
      persistSeenQuestionHistory(slug, quiz.id, nextSeenQuestionIds);
      setSeenQuestionHistoryCount(nextSeenQuestionIds.length);
      setHistoryNotice(null);

      setStarted(true);
      setFinished(false);
      setIndex(0);
      setAnswers({});
      setResult(null);
      setError(null);
      setSessionQuestions(nextSessionQuestions);
      setSessionExpiresAt(expiresAt);
      setTimeLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    } finally {
      prepareLockRef.current = false;
      setPreparingSession(false);
    }
  }

  async function handleFinish() {
    if (!quiz || !activeQuestions.length || submitting || submitLockRef.current) return;

    submitLockRef.current = true;
    setFinished(true);
    setSubmitting(true);
    setError(null);

    try {
      const orderedAnswers = activeQuestions.map((_question, idx) => answers[idx] ?? -1);
      const nextResult = await submitQuizAttempt(quiz.id, {
        answers: orderedAnswers,
        questionIds: activeQuestions.map((question) => question.id),
      });
      setResult(nextResult);
      clearStoredQuizSession(slug);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  }

  async function handleSubmitCurrentAnswer() {
    if (!currentAnswerSelected || submitting) return;
    if (index >= activeQuestions.length - 1) {
      await handleFinish();
      return;
    }
    setIndex((value) => Math.min(activeQuestions.length - 1, value + 1));
  }

  if (loading) {
    return (
      <Card style={{ borderRadius: 28 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Spinner size={18} /> Loading quiz questions...
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <SkeletonBlock width="28%" height={28} radius={999} />
            <SkeletonBlock width="72%" height={44} radius={18} />
            <SkeletonBlock width="94%" height={14} />
            <div className="insightGrid">
              {[0, 1, 2, 3].map((item) => (
                <Card key={item} style={{ borderRadius: 18, padding: 14 }}>
                  <SkeletonBlock width="48%" height={12} />
                  <SkeletonBlock width="60%" height={24} style={{ marginTop: 10 }} />
                </Card>
              ))}
            </div>
          </div>
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
            background: "linear-gradient(135deg, var(--heroSurface), var(--heroSurfaceSoft))",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <Badge tone={quiz.isSpecial ? "warning" : "info"}>{quiz.title}</Badge>
                <Badge tone="neutral">{quiz.category ?? "General"}</Badge>
                <Badge tone="neutral">{quiz.difficulty}</Badge>
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(1.9rem, 4vw, 2.2rem)", marginTop: 12 }}>
                {quiz.title}
              </div>
              <div style={{ color: "var(--muted)", marginTop: 10, maxWidth: 720 }}>{quiz.description}</div>
              <div className="insightGrid" style={{ marginTop: 18 }}>
                {[
                  { label: "Question bank", value: String(quiz.questionCount) },
                  { label: "This session", value: String(sessionTotal) },
                  { label: "Timer", value: `${safeTimeLimitMinutes} min` },
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
                background: "var(--panelStrong)",
                minWidth: 0,
              }}
            >
              {!started ? (
                <div style={{ display: "grid", gap: 14 }}>
                  {preparingSession ? (
                    <div style={{ padding: 12, borderRadius: 16, background: "rgba(255,255,255,0.08)", display: "grid", gap: 8 }}>
                      <div style={{ fontWeight: 900 }}>Generating quiz questions</div>
                      <div style={{ color: "var(--muted)", fontSize: 13 }}>Building your custom session now.</div>
                      <div style={{ display: "grid", gap: 6 }}>
                        <SkeletonBlock width="86%" height={10} radius={10} />
                        <SkeletonBlock width="72%" height={10} radius={10} />
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.72 }}>Session builder</div>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(1.2rem, 3vw, 1.6rem)", marginTop: 8 }}>
                      Customize this subject
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.82, marginTop: 8 }}>
                      Choose how many questions you want and how much time you want to give yourself before you start.
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 14 }}>
                    <label style={{ display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 12, opacity: 0.72 }}>Questions in this session</span>
                        <span style={{ fontWeight: 900 }}>{safeQuestionCount}</span>
                      </div>
                      <input
                        type="range"
                        min={minQuestions}
                        max={quiz.questionCount}
                        step={1}
                        value={safeQuestionCount}
                        onChange={(event) => updateQuestionCount(Number(event.target.value))}
                      />
                      <input
                        type="number"
                        min={minQuestions}
                        max={quiz.questionCount}
                        value={safeQuestionCount}
                        onChange={(event) => updateQuestionCount(Number(event.target.value || minQuestions))}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 16,
                          border: "1px solid var(--border)",
                          background: "rgba(255,255,255,0.08)",
                          color: "var(--text)",
                        }}
                      />
                    </label>

                    <label style={{ display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 12, opacity: 0.72 }}>Time limit</span>
                        <span style={{ fontWeight: 900 }}>{safeTimeLimitMinutes} min</span>
                      </div>
                      <input
                        type="range"
                        min={MIN_TIME_LIMIT_MINUTES}
                        max={MAX_TIME_LIMIT_MINUTES}
                        step={1}
                        value={safeTimeLimitMinutes}
                        onChange={(event) => updateTimeLimit(Number(event.target.value))}
                      />
                      <input
                        type="number"
                        min={MIN_TIME_LIMIT_MINUTES}
                        max={MAX_TIME_LIMIT_MINUTES}
                        value={safeTimeLimitMinutes}
                        onChange={(event) => updateTimeLimit(Number(event.target.value || MIN_TIME_LIMIT_MINUTES))}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 16,
                          border: "1px solid var(--border)",
                          background: "rgba(255,255,255,0.08)",
                          color: "var(--text)",
                        }}
                      />
                    </label>
                  </div>

                  <div style={{ padding: 12, borderRadius: 16, background: "rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 12, opacity: 0.72 }}>Recommended pacing</div>
                    <div style={{ fontWeight: 900, marginTop: 6 }}>
                      {safeQuestionCount} questions in about {recommendedTimeLimit} minutes
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Button onClick={() => void startQuiz()} disabled={preparingSession}>
                      {preparingSession ? <Spinner size={16} /> : null} {preparingSession ? "Generating quiz..." : "Start custom session"}
                    </Button>
                    <Badge tone="success">Bank ready</Badge>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, opacity: 0.72 }}>Session status</div>
                      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(1.2rem, 3vw, 1.6rem)", marginTop: 8 }}>
                        {finished ? "Completed" : "In progress"}
                      </div>
                    </div>
                    {submitting || preparingSession ? <Spinner /> : <Badge tone="success">Live</Badge>}
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
                        {answeredCount}/{activeQuestions.length}
                      </div>
                    </div>
                    <div style={{ padding: 12, borderRadius: 16, background: "rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: 12, opacity: 0.72 }}>Session size</div>
                      <div style={{ fontWeight: 900, marginTop: 6 }}>{activeQuestions.length} questions</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                    {!finished ? (
                      <Button variant="ghost" onClick={() => void handleFinish()} disabled={submitting}>
                        Finish now
                      </Button>
                    ) : null}
                    {finished ? (
                      <>
                        <Button variant="ghost" onClick={() => void startQuiz()} disabled={preparingSession}>
                          Retry same setup
                        </Button>
                        <Button variant="ghost" onClick={handleResetQuestionHistory} disabled={seenQuestionHistoryCount === 0}>
                          Reset question history
                        </Button>
                        <Button variant="ghost" onClick={resetToSetup}>
                          Change setup
                        </Button>
                      </>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </MotionIn>

      {error ? (
        <Alert tone="danger" title="Quiz error">
          {error}
        </Alert>
      ) : null}

      {historyNotice ? (
        <Alert tone="success" title="Question history updated">
          {historyNotice}
        </Alert>
      ) : null}

      {!started ? (
        <Card style={{ borderRadius: 24 }}>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ color: "var(--muted)" }}>
              Each session is built from the full subject bank. MANABU rotates through unseen questions first so the same
              prompts do not repeat until the bank has been worked through, while scoring, XP, and attempt history are still
              saved by the backend.
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                padding: 14,
                borderRadius: 18,
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.55 }}>
                {seenQuestionHistoryCount > 0
                  ? `This device currently remembers ${seenQuestionHistoryCount} question${seenQuestionHistoryCount === 1 ? "" : "s"} for this quiz.`
                  : "No question history is saved for this quiz yet."}
              </div>
              <Button variant="ghost" onClick={handleResetQuestionHistory} disabled={seenQuestionHistoryCount === 0}>
                Reset question history
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {started && !finished && current ? (
        <Card style={{ borderRadius: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(1.2rem, 3vw, 1.5rem)" }}>
              Question {index + 1} of {activeQuestions.length}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Badge tone="neutral">{current.difficulty}</Badge>
              <Badge tone="info">{quiz.category ?? "General"}</Badge>
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 18, fontWeight: 800, lineHeight: 1.45 }}>{current.prompt}</div>
          <div
            style={{
              marginTop: 14,
              height: 10,
              borderRadius: 999,
              overflow: "hidden",
              background: "rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                width: `${Math.max(((index + 1) / activeQuestions.length) * 100, 8)}%`,
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, var(--primary), var(--primary2))",
                boxShadow: "0 0 18px rgba(56, 189, 248, 0.2)",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>Choose one answer before you continue.</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Timer: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </div>
          </div>
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
                    padding: 16,
                    minHeight: 52,
                    borderRadius: 20,
                    border: `1px solid ${selected ? "rgba(56, 189, 248, 0.35)" : "var(--border)"}`,
                    background: selected
                      ? "linear-gradient(135deg, rgba(56, 189, 248, 0.14), rgba(74, 222, 128, 0.08))"
                      : "rgba(255,255,255,0.04)",
                    color: "var(--text)",
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                  aria-pressed={selected}
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
            <Button onClick={() => void handleSubmitCurrentAnswer()} disabled={!currentAnswerSelected || submitting}>
              {index >= activeQuestions.length - 1 ? "Finish quiz" : "Submit answer"}
            </Button>
          </div>
        </Card>
      ) : null}

      {finished ? (
        <Card style={{ borderRadius: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="completionBadge">✓</div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(1.2rem, 3vw, 1.5rem)" }}>
              Results
            </div>
          </div>
          {submitting ? (
            <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
              <Spinner size={16} /> Calculating and saving your result...
            </div>
          ) : result ? (
            <>
              <div className="insightGrid" style={{ marginTop: 14 }}>
                {[
                  { label: "Score", value: `${result.score}%` },
                  { label: "Correct answers", value: `${result.correctAnswers}/${result.totalQuestions}` },
                  { label: "Accuracy percentage", value: `${result.score}%` },
                  { label: "XP earned", value: String(result.xpEarned) },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: 14,
                      borderRadius: 18,
                      border: "1px solid var(--border)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{item.label}</div>
                    <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 24, marginTop: 8 }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                {result.review.map((item) => (
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
            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              <Alert tone="warning" title="Result unavailable">
                The quiz was completed, but saving the result did not finish successfully. You can retry the submission
                without losing your current attempt.
              </Alert>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button onClick={() => void handleFinish()} disabled={submitting}>
                  Retry submission
                </Button>
                <Button variant="ghost" onClick={resetToSetup}>
                  Change setup
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}
