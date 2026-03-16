"use client";

import React from "react";

import { useAuth } from "../../../auth/AuthProvider";
import { MotionIn } from "../../../components/motion/MotionIn";
import { Badge } from "../../../components/ui/Badge";
import { ButtonLink } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function ProfilePage(): JSX.Element {
  const { state } = useAuth();

  if (state.status !== "auth") {
    return (
      <Card style={{ borderRadius: 24 }}>
        <div style={{ fontWeight: 900 }}>Session missing</div>
        <div style={{ color: "var(--muted)", marginTop: 6 }}>Log in to view your profile details.</div>
        <div style={{ marginTop: 12 }}>
          <ButtonLink href="/login">Go to login</ButtonLink>
        </div>
      </Card>
    );
  }

  const { user } = state;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MotionIn>
        <Card style={{ borderRadius: 26, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>Profile</div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(1.4rem, 3vw, 2rem)", marginTop: 8 }}>
                {user.displayName}
              </div>
              <div style={{ color: "var(--muted)", marginTop: 6 }}>{user.email}</div>
            </div>
            <Badge tone="info">{user.role.toUpperCase()}</Badge>
          </div>
        </Card>
      </MotionIn>

      <MotionIn delay={0.04}>
        <Card style={{ borderRadius: 24, padding: 18 }}>
          <div style={{ fontWeight: 900 }}>Account status</div>
          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            <div style={{ padding: 12, borderRadius: 16, border: "1px solid var(--border)", background: "rgba(255,255,255,0.05)" }}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>Role</div>
              <div style={{ fontWeight: 800, marginTop: 6 }}>{user.role}</div>
            </div>
            {user.status ? (
              <div style={{ padding: 12, borderRadius: 16, border: "1px solid var(--border)", background: "rgba(255,255,255,0.05)" }}>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>Status</div>
                <div style={{ fontWeight: 800, marginTop: 6 }}>{user.status}</div>
              </div>
            ) : null}
          </div>
        </Card>
      </MotionIn>
    </div>
  );
}
