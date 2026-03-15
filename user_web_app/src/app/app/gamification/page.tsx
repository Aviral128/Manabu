"use client";

import React from "react";

import { useAuth } from "../../../auth/AuthProvider";
import { PlainLanguagePanel } from "../../../components/common/PlainLanguagePanel";
import { MotionIn } from "../../../components/motion/MotionIn";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Spinner } from "../../../components/ui/Spinner";
import { fetchGamificationProfile, fetchRewards } from "../../../services/gamification";

export default function GamificationPage(): JSX.Element {
  const { state } = useAuth();
  const userId = state.status === "auth" ? state.userId : null;

  const [busy, setBusy] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<any | null>(null);
  const [rewards, setRewards] = React.useState<any | null>(null);

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
      setError(null);
      try {
        const [p, r] = await Promise.all([fetchGamificationProfile(userId), fetchRewards(userId)]);
        if (!alive) return;
        setProfile(p);
        setRewards(r);
      } catch (e) {
        if (!alive) return;
        setError((e as Error).message);
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [state.status, userId]);

  if (!userId && state.status === "loading") {
    return (
      <Card style={{ borderRadius: 28 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Spinner size={18} /> Loading gamification data...
        </div>
      </Card>
    );
  }

  if (!userId) {
    return (
      <Alert tone="warning" title="Session expired">
        Your gamification session is no longer active. Please sign in again to continue.
      </Alert>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MotionIn>
        <Card style={{ borderRadius: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22 }}>Gamification</div>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>XP, levels, streaks, and rewards</div>
            </div>
            {busy ? <Spinner /> : <Badge tone="success">Live</Badge>}
          </div>
          {error ? (
            <div style={{ marginTop: 10 }}>
              <Alert tone="danger" title="Gamification data issue">
                {error}
              </Alert>
            </div>
          ) : null}
        </Card>
      </MotionIn>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 12 }}>
        <div style={{ gridColumn: "span 12" }}>
          <Card>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Badge tone="info">XP: {profile?.xp ?? "-"}</Badge>
              <Badge tone="neutral">Level: {profile?.level ?? "-"}</Badge>
              <Badge tone="warning">Streak: {profile?.dailyStreak ?? "-"} days</Badge>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Badges</div>
              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {Array.isArray(profile?.badges) ? profile.badges.map((b: string) => <Badge key={b} tone="success">{b}</Badge>) : null}
                {!Array.isArray(profile?.badges) ? <div style={{ color: "var(--muted)" }}>No badges.</div> : null}
              </div>
            </div>
          </Card>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <PlainLanguagePanel
            title="Rewards"
            description="Readable reward details from gamification-service."
            data={rewards}
          />
        </div>
      </div>
    </div>
  );
}
