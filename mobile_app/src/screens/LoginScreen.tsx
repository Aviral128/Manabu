import React from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { ScreenShell } from "../components/ScreenShell";
import { useAuth } from "../contexts/AuthContext";
import type { RootStackParamList } from "../navigation/types";
import { theme } from "../theme/tokens";

export function LoginScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Login">) {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleLogin() {
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenShell>
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Text style={{ color: theme.colors.textMuted, textTransform: "uppercase", letterSpacing: 1.2, fontSize: 12 }}>AI-powered learning ecosystem</Text>
        <Text style={{ color: theme.colors.text, fontSize: 34, fontWeight: "800", marginTop: 12 }}>Welcome back</Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 10 }}>
          Login to sync your quizzes, streaks, and progress with the shared MANABU backend.
        </Text>
      </Card>

      <Card>
        <View style={{ gap: 12 }}>
          <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
          <Button title={busy ? "Signing in..." : "Login"} onPress={() => void handleLogin()} disabled={busy} />
          <Button title="Create account" variant="ghost" onPress={() => navigation.navigate("Signup")} />
        </View>
      </Card>
    </ScreenShell>
  );
}
