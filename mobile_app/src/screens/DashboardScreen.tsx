import React from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Loader } from "../components/Loader";
import { ScreenShell } from "../components/ScreenShell";
import { useAuth } from "../contexts/AuthContext";
import type { RootStackParamList } from "../navigation/types";
import { theme } from "../theme/tokens";

export function DashboardScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Dashboard">) {
  const { user, loading, logout } = useAuth();

  if (loading || !user) {
    return <Loader label="Restoring your learning session..." />;
  }

  return (
    <ScreenShell>
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Text style={{ color: theme.colors.textMuted, textTransform: "uppercase", fontSize: 12, letterSpacing: 1.2 }}>
          MANABU mobile
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 32, fontWeight: "800", marginTop: 10 }}>
          {user.displayName}, your next win is one session away.
        </Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 10 }}>
          Persistent profile sync is active. Your quizzes and progress now flow through the same backend used by the web apps.
        </Text>
      </Card>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {[
          { label: "Role", value: user.role },
          { label: "XP", value: String(user.leaderboard?.points ?? 0) },
          { label: "Level", value: String(user.leaderboard?.level ?? 1) },
          { label: "Streak", value: String(user.leaderboard?.streak ?? 0) },
        ].map((item) => (
          <Card key={item.label} style={{ flexBasis: "47%", flexGrow: 1 }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{item.label}</Text>
            <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "800", marginTop: 8 }}>{item.value}</Text>
          </Card>
        ))}
      </View>

      <Card>
        <View style={{ gap: 12 }}>
          <Button title="Open quiz catalog" onPress={() => navigation.navigate("QuizCatalog")} />
          <Button title="About Admin" variant="ghost" onPress={() => navigation.navigate("AboutAdmin")} />
          {user.role === "admin" ? <Button title="Admin control center" variant="ghost" onPress={() => navigation.navigate("AdminControl")} /> : null}
          <Button title="Logout" variant="ghost" onPress={() => void logout()} />
        </View>
      </Card>

      <Card>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "800" }}>Recent attempts</Text>
        <View style={{ gap: 10, marginTop: 12 }}>
          {(user.recentAttempts ?? []).slice(0, 5).map((attempt) => (
            <View key={attempt.attemptId} style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.md }}>
              <Text style={{ color: theme.colors.text, fontWeight: "800" }}>{attempt.quizTitle}</Text>
              <Text style={{ color: theme.colors.textMuted, marginTop: 4 }}>
                Score {attempt.score}% • {attempt.correctAnswers}/{attempt.totalQuestions} correct
              </Text>
            </View>
          ))}
          {!(user.recentAttempts ?? []).length ? <Text style={{ color: theme.colors.textMuted }}>No attempts yet. Start with a quiz.</Text> : null}
        </View>
      </Card>
    </ScreenShell>
  );
}
