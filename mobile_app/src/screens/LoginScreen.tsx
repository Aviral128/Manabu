import React from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { BrandHeroCard } from "../components/BrandHeroCard";
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
      <BrandHeroCard
        eyebrow="Cinematic adaptive learning"
        title="Welcome back"
        body="Login to sync your quizzes, streaks, and progress with the same MANABU experience you see on the web."
      />

      <Card>
        <View style={{ gap: 12 }}>
          <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Enter your email" />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Enter your password" />
          {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
          <Button title={busy ? "Signing in..." : "Login"} onPress={() => void handleLogin()} disabled={busy} />
          <Button title="Create account" variant="ghost" onPress={() => navigation.navigate("Signup")} />
        </View>
      </Card>
    </ScreenShell>
  );
}
