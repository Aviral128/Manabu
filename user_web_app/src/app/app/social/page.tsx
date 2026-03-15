"use client";

import React from "react";

import { useAuth } from "../../../auth/AuthProvider";
import { MotionIn } from "../../../components/motion/MotionIn";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Spinner } from "../../../components/ui/Spinner";
import { fetchFriends, fetchGlobalLeaderboard } from "../../../services/social";

type Post = { id: string; author: string; text: string; ts: string };

const POSTS_KEY_PREFIX = "manabu_social_posts_v1";

function getPostsKey(userId: string) {
  return `${POSTS_KEY_PREFIX}:${userId}`;
}

function loadPosts(userId: string): Post[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getPostsKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Post[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePosts(userId: string, posts: Post[]) {
  localStorage.setItem(getPostsKey(userId), JSON.stringify(posts));
}

export default function SocialPage(): JSX.Element {
  const { state } = useAuth();
  const userId = state.status === "auth" ? state.userId : null;

  const [busy, setBusy] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [friends, setFriends] = React.useState<any[]>([]);
  const [leaderboard, setLeaderboard] = React.useState<any[]>([]);

  const [posts, setPosts] = React.useState<Post[]>([]);
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    if (!userId) return;
    setPosts(loadPosts(userId));
  }, [userId]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !userId) return;
    savePosts(userId, posts);
  }, [posts, userId]);

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
        const [fr, lb] = await Promise.all([fetchFriends(userId), fetchGlobalLeaderboard()]);
        if (!alive) return;
        setFriends(Array.isArray((fr as any).friends) ? (fr as any).friends : []);
        setLeaderboard(Array.isArray((lb as any).entries) ? (lb as any).entries : []);
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
          <Spinner size={18} /> Loading social space...
        </div>
      </Card>
    );
  }

  if (!userId) {
    return (
      <Alert tone="warning" title="Session expired">
        Your social session is no longer active. Please sign in again to continue.
      </Alert>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MotionIn>
        <Card style={{ borderRadius: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22 }}>Social</div>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>Posts, friends, and leaderboards</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {busy ? <Spinner /> : <Badge tone="success">Connected</Badge>}
              <Badge tone="neutral">social-service</Badge>
            </div>
          </div>
          {error ? (
            <div style={{ marginTop: 10 }}>
              <Alert tone="danger" title="Social data issue">
                {error}
              </Alert>
            </div>
          ) : null}
        </Card>
      </MotionIn>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: 12 }}>
        <div style={{ gridColumn: "span 12" }}>
          <Card>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Create a post</div>
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Share progress, ask a question..." />
              <Button
                onClick={() => {
                  if (!text.trim()) return;
                  setPosts((prev) => [
                    { id: `p_${Date.now()}`, author: userId, text: text.trim(), ts: new Date().toISOString() },
                    ...prev,
                  ]);
                  setText("");
                }}
              >
                Post
              </Button>
            </div>
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {posts.length === 0 ? <div style={{ color: "var(--muted)" }}>No posts yet.</div> : null}
              {posts.slice(0, 6).map((p) => (
                <div key={p.id} style={{ padding: 12, borderRadius: 18, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 900 }}>{p.author}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(p.ts).toLocaleString()}</div>
                  </div>
                  <div style={{ marginTop: 8 }}>{p.text}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <Card>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Friends</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>From `/v1/social/friends/:userId`</div>
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {friends.map((f) => (
                <div key={f.userId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 18, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)" }}>
                  <div style={{ fontWeight: 900 }}>{f.name}</div>
                  <Badge tone={f.status === "online" ? "success" : "neutral"}>{f.status}</Badge>
                </div>
              ))}
              {friends.length === 0 ? <div style={{ color: "var(--muted)" }}>No friends loaded.</div> : null}
            </div>
          </Card>
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <Card>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900 }}>Leaderboard</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>From `/v1/social/leaderboard/global`</div>
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {leaderboard.map((e) => (
                <div key={e.userId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 18, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <Badge tone="info">#{e.rank}</Badge>
                    <div style={{ fontWeight: 900 }}>{e.userId}</div>
                  </div>
                  <Badge tone="warning">{e.xp} XP</Badge>
                </div>
              ))}
              {leaderboard.length === 0 ? <div style={{ color: "var(--muted)" }}>No leaderboard data.</div> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
