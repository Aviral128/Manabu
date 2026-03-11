"use client";

import React from "react";

import { PlainLanguageCard } from "../../../components/common/PlainLanguageCard";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { DataTable } from "../../../components/tables/DataTable";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Spinner } from "../../../components/ui/Spinner";
import { createBattle, fetchFriends, fetchGlobalLeaderboard } from "../../../services/social";

type LeaderboardEntry = { rank: number; userId: string; xp: number };
type FriendEntry = { userId: string; name: string; status: string };
type ModerationState = "clear" | "watch" | "restricted";
type ActionLogItem = { id: string; userId: string; action: string; note: string; at: string };

export default function SocialModerationPage(): JSX.Element {
  const [busy, setBusy] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
  const [friends, setFriends] = React.useState<FriendEntry[]>([]);
  const [userId, setUserId] = React.useState("usr_001");
  const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
  const [moderationNote, setModerationNote] = React.useState("Monitor for leaderboard abuse.");
  const [states, setStates] = React.useState<Record<string, ModerationState>>({});
  const [actionLog, setActionLog] = React.useState<ActionLogItem[]>([]);
  const [battleResult, setBattleResult] = React.useState<unknown | null>(null);

  const refresh = React.useCallback(async () => {
    setBusy(true);
    setErrors([]);

    const [leaderboardResult, friendsResult] = await Promise.allSettled([
      fetchGlobalLeaderboard(),
      fetchFriends(userId),
    ]);

    const nextErrors: string[] = [];

    if (leaderboardResult.status === "fulfilled") {
      setLeaderboard(Array.isArray((leaderboardResult.value as any).entries) ? (leaderboardResult.value as any).entries : []);
    } else {
      nextErrors.push(`Leaderboard: ${leaderboardResult.reason instanceof Error ? leaderboardResult.reason.message : "Unknown error"}`);
      setLeaderboard([]);
    }

    if (friendsResult.status === "fulfilled") {
      setFriends(Array.isArray((friendsResult.value as any).friends) ? (friendsResult.value as any).friends : []);
    } else {
      nextErrors.push(`Friends graph: ${friendsResult.reason instanceof Error ? friendsResult.reason.message : "Unknown error"}`);
      setFriends([]);
    }

    setErrors(nextErrors);
    setBusy(false);
  }, [userId]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  function applyAction(user: string, nextState: ModerationState, action: string) {
    setStates((current) => ({ ...current, [user]: nextState }));
    setSelectedUser(user);
    setActionLog((current) => [
      {
        id: `${user}_${Date.now()}`,
        userId: user,
        action,
        note: moderationNote,
        at: new Date().toLocaleTimeString(),
      },
      ...current,
    ]);
  }

  const restrictedCount = Object.values(states).filter((state) => state === "restricted").length;
  const watchCount = Object.values(states).filter((state) => state === "watch").length;

  return (
    <div>
      <SectionHeader
        title="Social Moderation"
        subtitle="Monitor battles, leaderboards, and the friend graph with safer moderation controls."
        right={
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} style={{ width: 140 }} aria-label="User ID" />
            <Button variant="ghost" onClick={() => void refresh()} disabled={busy}>
              {busy ? <Spinner size={16} /> : null} Refresh
            </Button>
          </div>
        }
      />

      {errors.length ? (
        <Card style={{ marginBottom: 12, border: "1px solid rgba(239, 68, 68, 0.35)" }}>
          <div style={{ fontWeight: 900 }}>Social service issues</div>
          <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
            {errors.map((error) => (
              <div key={error} style={{ color: "var(--muted)" }}>
                {error}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 12 }}>
        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <div style={{ padding: 14, borderRadius: 18, border: "1px solid var(--border)", background: "var(--panelStrong)" }}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>Leaderboard entries</div>
              <div style={{ fontWeight: 900, fontSize: 28, marginTop: 8 }}>{leaderboard.length}</div>
            </div>
            <div style={{ padding: 14, borderRadius: 18, border: "1px solid var(--border)", background: "var(--panelStrong)" }}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>Friend connections</div>
              <div style={{ fontWeight: 900, fontSize: 28, marginTop: 8 }}>{friends.length}</div>
            </div>
            <div style={{ padding: 14, borderRadius: 18, border: "1px solid var(--border)", background: "var(--panelStrong)" }}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>Watch list</div>
              <div style={{ fontWeight: 900, fontSize: 28, marginTop: 8 }}>{watchCount}</div>
            </div>
            <div style={{ padding: 14, borderRadius: 18, border: "1px solid var(--border)", background: "var(--panelStrong)" }}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>Restricted</div>
              <div style={{ fontWeight: 900, fontSize: 28, marginTop: 8 }}>{restrictedCount}</div>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Badge tone="neutral">Source: social-service</Badge>
            <Button
              variant="solid"
              onClick={async () => {
                setBusy(true);
                try {
                  const response = await createBattle();
                  setBattleResult(response);
                  setErrors([]);
                } catch (caught) {
                  setErrors([(caught as Error).message]);
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
            >
              Create battle
            </Button>
          </div>
        </Card>

        {battleResult ? (
          <div style={{ gridColumn: "span 12" }}>
            <PlainLanguageCard title="Latest battle launch" description="Translated from the social-service response." data={battleResult} />
          </div>
        ) : null}

        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Global leaderboard</div>
          <div style={{ marginTop: 12 }}>
            <DataTable<LeaderboardEntry>
              rows={leaderboard}
              searchKeys={["userId"]}
              pageSize={6}
              columns={[
                { key: "rank", header: "Rank" },
                { key: "userId", header: "User", render: (row) => <span style={{ fontWeight: 900 }}>{row.userId}</span> },
                { key: "xp", header: "XP", render: (row) => <Badge tone="info">{row.xp}</Badge> },
                {
                  key: "moderation",
                  header: "Moderation",
                  render: (row) => {
                    const state = states[row.userId] ?? "clear";
                    return <Badge tone={state === "restricted" ? "danger" : state === "watch" ? "warning" : "success"}>{state}</Badge>;
                  },
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (row) => (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button variant="ghost" onClick={() => applyAction(row.userId, "watch", "Watch account")}>
                        Watch
                      </Button>
                      <Button variant="danger" onClick={() => applyAction(row.userId, "restricted", "Restrict account")}>
                        Restrict
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </Card>

        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Friends graph</div>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>From `/v1/social/friends/:userId`</div>
          <div style={{ marginTop: 12 }}>
            <DataTable<FriendEntry>
              rows={friends}
              searchKeys={["userId", "name", "status"]}
              pageSize={6}
              columns={[
                { key: "userId", header: "User ID" },
                { key: "name", header: "Name", render: (friend) => <span style={{ fontWeight: 900 }}>{friend.name}</span> },
                { key: "status", header: "Status", render: (friend) => <Badge tone={friend.status === "online" ? "success" : "neutral"}>{friend.status}</Badge> },
                {
                  key: "moderation",
                  header: "Moderation",
                  render: (friend) => {
                    const state = states[friend.userId] ?? "clear";
                    return <Badge tone={state === "restricted" ? "danger" : state === "watch" ? "warning" : "success"}>{state}</Badge>;
                  },
                },
              ]}
            />
          </div>
        </Card>

        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Moderator note</div>
              <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>
                Use this note whenever you flag an account from the leaderboard or friend graph.
              </div>
            </div>
            <textarea
              value={moderationNote}
              onChange={(event) => setModerationNote(event.target.value)}
              style={{
                width: "100%",
                minHeight: 110,
                padding: 12,
                borderRadius: 16,
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.04)",
                color: "var(--text)",
              }}
            />
            {selectedUser ? (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                Last selected account: <strong style={{ color: "var(--text)" }}>{selectedUser}</strong>
              </div>
            ) : null}
          </div>
        </Card>

        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Moderation action log</div>
              <div style={{ color: "var(--muted)", marginTop: 4, fontSize: 13 }}>UI-local actions until backend moderation policies are introduced.</div>
            </div>
            <Badge tone="neutral">{actionLog.length} action{actionLog.length === 1 ? "" : "s"}</Badge>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {actionLog.length ? (
              actionLog.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 900 }}>{item.userId}</div>
                    <Badge tone="info">{item.action} at {item.at}</Badge>
                  </div>
                  <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 13 }}>{item.note}</div>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--muted)" }}>No moderation actions have been recorded in this session.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
