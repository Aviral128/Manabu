import React from "react";
import { Text } from "react-native";

import { Card } from "../components/Card";
import { ScreenShell } from "../components/ScreenShell";
import { theme } from "../theme/tokens";

export function AboutAdminScreen() {
  return (
    <ScreenShell>
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Text style={{ color: theme.colors.textMuted, textTransform: "uppercase", fontSize: 12, letterSpacing: 1.2 }}>
          About Admin
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 30, fontWeight: "800", marginTop: 12 }}>Aviral Sultaniya</Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 10 }}>Grade: 10th</Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 6 }}>School: Macro Vision Academy, Burhanpur</Text>
      </Card>
      <Card>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "800" }}>Builder note</Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 10 }}>
          MANABU is being shaped as a modern AI learning ecosystem with shared backend services, premium web interfaces,
          and a stable Expo mobile app.
        </Text>
      </Card>
    </ScreenShell>
  );
}
