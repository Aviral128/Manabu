"use client";

import React from "react";

import { useAuth } from "../../../auth/AuthProvider";
import { PlainLanguagePanel } from "../../../components/common/PlainLanguagePanel";
import { DashboardStatCard } from "../../../components/dashboard/DashboardStatCard";
import { MotionIn } from "../../../components/motion/MotionIn";
import { Badge } from "../../../components/ui/Badge";
import { ButtonLink } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";
import { Alert } from "../../../components/ui/Alert";
import { SkeletonBlock } from "../../../components/ui/SkeletonBlock";
import { fetchAnalyticsDashboard } from "../../../services/analytics";
import { fetchGamificationProfile } from "../../../services/gamification";
import { fetchLearningPlan } from "../../../services/learning";
import { fetchRecommendations } from "../../../services/recommendations";
import { fetchLearningHistory, fetchUserProfile } from "../../../services/user";
import { formatPercent } from "../../../utils/format";

type ServiceNote = { label: string; message: string };

function DashboardLoadingState(): JSX.Element {
  return (
    <div style={{ display: "grid", gap: 12, paddingTop: 2 }}>
      <Card
        style={{
          borderRadius: 30,
          padding: 22,
          background: "linear-gradient(135deg, var(--heroSurface), var(--heroSurfaceSoft))",
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <div style={{ display: "grid", gap: 14 }}>
            <SkeletonBlock width={128} height={28} radius={999} />
            <SkeletonBlock width="78%" height={48} radius={20} />
            <SkeletonBlock width="96%" height={14} />
            <SkeletonBlock width="82%" height={14} />
            <div className="insightGrid" style={{ marginTop: 6 }}>
              {[0, 1, 2].map((item) => (
                <Card key={item} style={{ borderRadius: 20, padding: 14, background: "var(--panelStrong)" }}>
                  <SkeletonBlock width="42%" height={12} />
                  <SkeletonBlock width="60%" height={30} style={{ marginTop: 10 }} />
                </Card>
              ))}
            </div>
          </div>
          <Card style={{ borderRadius: 24, padding: 18, background: "var(--panelStrong)" }}>
            <div style={{ display: "grid", gap: 12 }}>
              <SkeletonBlock width="38%" height={12} />
              <SkeletonBlock width="54%" height={30} />
              {[0, 1, 2].map((item) => (
                <div key={item} style={{ padding: 12, borderRadius: 16, background: "rgba(255,255,255,0.06)" }}>
                  <SkeletonBlock width="50%" height={12} />
                  <SkeletonBlock width="34%" height={24} style={{ marginTop: 8 }} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {[0, 1, 2, 3].map((item) => (
          <Card key={item} style={{ borderRadius: 22, padding: 18 }}>
            <SkeletonBlock width="42%" height={12} />
            <SkeletonBlock width="58%" height={34} style={{ marginTop: 10 }} />
            <SkeletonBlock width="100%" height={12} style={{ marginTop: 12 }} />
          </Card>
        ))}
      </div>

      <Card style={{ borderRadius: 24, padding: 18 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Spinner size={18} />
          <div>
            <div style={{ fontWeight: 900 }}>Loading dashboard</div>
            <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>
              Pulling your live profile, analytics, learning plan, recommendations, and quiz history.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function UserDashboardPage(): JSX.Element {
  const { state } = useAuth();
  const userId = state.status === "auth" ? state.userId : null;

  const [busy, setBusy] = React.useState(true);
  const [profile, setProfile] = React.useState<any | null>(null);
  const [history, setHistory] = React.useState<any | null>(null);
  const [analytics, setAnalytics] = React.useState<any | null>(null);
  const [plan, setPlan] = React.useState<any | null>(null);
  const [recs, setRecs] = React.useState<any | null>(null);
  const [game, setGame] = React.useState<any | null>(null);
  const [notes, setNotes] = React.useState<ServiceNote[]>([]);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      if (!userId) {
        if (alive) {
          setBusy(state.status === "loading");
        }
        return;
      }

      setBusy(true);

      const [profileResult, historyResult, analyticsResult, planResult, recsResult, gameResult] =
        await Promise.allSettled([
          fetchUserProfile(userId),
          fetchLearningHistory(userId),
          fetchAnalyticsDashboard(userId),
          fetchLearningPlan(userId),
          fetchRecommendations(userId),
          fetchGamificationProfile(userId),
        ]);

      if (!alive) return;

      const nextNotes: ServiceNote[] = [];
      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
      else nextNotes.push({ label: "Profile", message: "Profile data is temporarily unavailable." });

      if (historyResult.status === "fulfilled") setHistory(historyResult.value);
      else nextNotes.push({ label: "History", message: "Recent activity could not be loaded." });

      if (analyticsResult.status === "fulfilled") setAnalytics(analyticsResult.value);
      else nextNotes.push({ label: "Analytics", message: "Analytics are delayed, so progress is estimated." });

      if (planResult.status === "fulfilled") setPlan(planResult.value);
      else nextNotes.push({ label: "Learning plan", message: "Today's plan is unavailable right now." });

      if (recsResult.status === "fulfilled") setRecs(recsResult.value);
      else nextNotes.push({ label: "Recommendations", message: "Recommendation service did not respond." });

      if (gameResult.status === "fulfilled") setGame(gameResult.value);
      else nextNotes.push({ label: "Gamification", message: "XP and streak data could not be refreshed." });

      setNotes(nextNotes);
      setBusy(false);
    })();

    return () => {
      alive = false;
    };
  }, [state.status, userId]);

  const masteryByTopic = Array.isArray(analytics?.masteryByTopic) ? analytics.masteryByTopic : [];
  const planItems = Array.isArray(plan?.plan) ? plan.plan : [];
  const recommendations = Array.isArray(recs?.recommendations) ? recs.recommendations : [];
  const recentActivity = Array.isArray(history?.recentActivity) ? history.recentActivity : [];
  const recentQuizzes = Array.isArray(profile?.recentAttempts) ? profile.recentAttempts : [];
  const quizStats = profile?.quizStats ?? {
    totalQuizzesTaken: recentQuizzes.length,
    averageAccuracy: recentQuizzes.length
      ? Math.round(recentQuizzes.reduce((sum: number, attempt: any) => sum + Number(attempt.score ?? 0), 0) / recentQuizzes.length)
      : 0,
    bestScore: recentQuizzes.length
      ? Math.max(...recentQuizzes.map((attempt: any) => Number(attempt.score ?? 0)))
      : 0,
  };
  const points = game?.xp ?? profile?.leaderboard?.points ?? "-";
  const level = game?.level ?? profile?.leaderboard?.level ?? "-";
  const streak = game?.dailyStreak ?? profile?.leaderboard?.streak ?? 0;
  const badgeCount = Array.isArray(game?.badges) ? game.badges.length : Array.isArray(profile?.leaderboard?.badges) ? profile.leaderboard.badges.length : "-";
  const initialLoading = busy && !profile && !history && !analytics && !plan && !recs && !game;
  const statsLoading = busy && !profile;

  if (!userId && state.status === "loading") {
    return <DashboardLoadingState />;
  }

  if (!userId) {
    return (
      <Alert tone="warning" title="Session expired">
        Your dashboard session is no longer active. Please sign in again to continue.
      </Alert>
    );
  }

  if (initialLoading) {
    return <DashboardLoadingState />;
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
            boxShadow: "var(--shadow)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <Badge tone="info">Learner dashboard</Badge>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(1.9rem, 4vw, 2.2rem)", marginTop: 12 }}>
                {profile?.displayName ?? "Learner"}, your next win is one focused session away.
              </div>
              <div style={{ color: "var(--muted)", marginTop: 10, maxWidth: 720, fontSize: 15 }}>
                MANABU is tracking accuracy, study rhythm, and mastery growth so your next practice block is easier to
                start and harder to waste.
              </div>

              <div className="insightGrid" style={{ marginTop: 18 }}>
                <div
                  style={{
                    padding: 14,
                    borderRadius: 20,
                    border: "1px solid var(--border)",
                    background: "var(--panelStrong)",
                    boxShadow: "var(--shadowSoft)",
                  }}
                >
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>Accuracy</div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 28, marginTop: 8 }}>
                    {analytics ? formatPercent(Number(analytics.accuracy ?? 0)) : "-"}
                  </div>
                </div>
                <div
                  style={{
                    padding: 14,
                    borderRadius: 20,
                    border: "1px solid var(--border)",
                    background: "var(--panelStrong)",
                    boxShadow: "var(--shadowSoft)",
                  }}
                >
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>Weekly minutes</div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 28, marginTop: 8 }}>
                    {analytics?.weeklyStudyMinutes ?? "-"}
                  </div>
                </div>
                <div
                  style={{
                    padding: 14,
                    borderRadius: 20,
                    border: "1px solid var(--border)",
                    background: "var(--panelStrong)",
                    boxShadow: "var(--shadowSoft)",
                  }}
                >
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>XP</div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 28, marginTop: 8 }}>
                    {points}
                  </div>
                </div>
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
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.72 }}>Momentum card</div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 24, marginTop: 8 }}>
                    {streak} day streak
                  </div>
                </div>
                {busy ? <Spinner /> : <Badge tone="success">Live</Badge>}
              </div>

              <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                {[
                  { label: "Current level", value: level },
                  { label: "Badges earned", value: badgeCount },
                  { label: "Open recommendations", value: recommendations.length },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: 12,
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.06)",
                    }}
                  >
                    <div style={{ fontSize: 12, opacity: 0.72 }}>{item.label}</div>
                    <div style={{ fontWeight: 900, marginTop: 6 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </MotionIn>

      <MotionIn delay={0.04}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(1.2rem, 3vw, 1.6rem)" }}>Performance snapshot</div>
              <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>
                Fast readouts from your attempt history and quiz performance.
              </div>
            </div>
            {busy ? <Badge tone="neutral">Refreshing</Badge> : <Badge tone="success">Live stats</Badge>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <DashboardStatCard
              label="Total quizzes taken"
              value={busy && !profile ? "..." : String(quizStats.totalQuizzesTaken)}
              helper="All recorded attempts linked to this account."
              loading={statsLoading}
            />
            <DashboardStatCard
              label="Average accuracy"
              value={busy && !profile ? "..." : `${quizStats.averageAccuracy}%`}
              helper="Your mean score across saved quiz attempts."
              loading={statsLoading}
            />
            <DashboardStatCard
              label="Best score"
              value={busy && !profile ? "..." : `${quizStats.bestScore}%`}
              helper="Your highest recorded score so far."
              loading={statsLoading}
            />
            <Card style={{ borderRadius: 22, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>Recent quizzes</div>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 24, marginTop: 8 }}>
                    {recentQuizzes.length}
                  </div>
                </div>
                <Badge tone="info">Latest attempts</Badge>
              </div>
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {recentQuizzes.length ? (
                  recentQuizzes.slice(0, 3).map((attempt: any) => (
                    <div
                      key={attempt.attemptId}
                      style={{
                        padding: 12,
                        borderRadius: 16,
                        border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>{attempt.quizTitle}</div>
                      <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>
                        {attempt.score}% score · {attempt.correctAnswers}/{attempt.totalQuestions} correct
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>
                      No quizzes yet. Start your first session to build a visible trend line here.
                    </div>
                    <ButtonLink href="/app/quiz" variant="ghost">
                      Start a quiz
                    </ButtonLink>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </MotionIn>

      {notes.length ? (
        <Alert tone="warning" title="Partial service data">
          {notes.map((note) => `${note.label}: ${note.message}`).join(" ")}
        </Alert>
      ) : null}

      <div className="dashboardGrid">
        <MotionIn delay={0.05}>
          <Card style={{ borderRadius: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Today's plan</div>
                <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>From learning-service</div>
              </div>
              <Badge tone="info">{planItems.length || 0} focus blocks</Badge>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {planItems.length ? (
                planItems.map((item: any) => (
                  <div
                    key={item.topic}
                    style={{
                      padding: 14,
                      borderRadius: 18,
                      border: "1px solid var(--border)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <div style={{ fontWeight: 900 }}>{item.topic}</div>
                      <Badge tone="success">{Math.round(Number(item.targetMastery ?? 0) * 100)}% target</Badge>
                    </div>
                    <div style={{ color: "var(--muted)", marginTop: 8, fontSize: 13 }}>
                      {Array.isArray(item.activities) ? item.activities.join(" - ") : "No activities available"}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ color: "var(--muted)" }}>No plan available right now.</div>
                  <ButtonLink href="/app/quiz" variant="ghost">
                    Build a practice session
                  </ButtonLink>
                </div>
              )}
            </div>
          </Card>
        </MotionIn>

        <MotionIn delay={0.1}>
          <Card style={{ borderRadius: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Mastery snapshot</div>
                <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>From analytics-service</div>
              </div>
              <Badge tone="neutral">{masteryByTopic.length || 0} topics</Badge>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              {masteryByTopic.length ? (
                masteryByTopic.map((item: any) => {
                  const pct = Math.round(Number(item.mastery ?? 0) * 100);
                  return (
                    <div key={item.topic}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                        <span style={{ fontWeight: 800 }}>{item.topic}</span>
                        <span style={{ color: "var(--muted)" }}>{pct}%</span>
                      </div>
                      <div
                        style={{
                          marginTop: 8,
                          height: 10,
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.08)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            borderRadius: 999,
                            background: "linear-gradient(90deg, var(--primary), var(--primary2))",
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: "var(--muted)" }}>No mastery data available.</div>
              )}
            </div>
          </Card>
        </MotionIn>
      </div>

      <div className="dashboardGrid">
        <MotionIn delay={0.14}>
          <Card style={{ borderRadius: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Recommendations</div>
                <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>Next best actions for this account</div>
              </div>
              <Badge tone="success">{recommendations.length || 0} queued</Badge>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {recommendations.length ? (
                recommendations.map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 14,
                      borderRadius: 18,
                      border: "1px solid var(--border)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                      <div style={{ fontWeight: 900 }}>{item.type}</div>
                      <Badge tone="info">{item.id}</Badge>
                    </div>
                    <div style={{ color: "var(--muted)", marginTop: 8, fontSize: 13 }}>{item.reason}</div>
                  </div>
                ))
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ color: "var(--muted)" }}>No recommendations available right now.</div>
                  <ButtonLink href="/app/quiz" variant="ghost">
                    Explore quizzes
                  </ButtonLink>
                </div>
              )}
            </div>
          </Card>
        </MotionIn>

        <MotionIn delay={0.18}>
          <Card style={{ borderRadius: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Recent activity</div>
                <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>From user-service learning history</div>
              </div>
              <Badge tone="neutral">{recentActivity.length || 0} events</Badge>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {recentActivity.length ? (
                recentActivity.map((item: any, index: number) => (
                  <PlainLanguagePanel
                    key={`${item.type ?? "event"}_${index}`}
                    title={item.type ?? "Activity"}
                    description="Translated from your learning history."
                    data={item}
                  />
                ))
              ) : (
                <div style={{ color: "var(--muted)" }}>No recent activity available.</div>
              )}
            </div>
          </Card>
        </MotionIn>
      </div>
    </div>
  );
}
