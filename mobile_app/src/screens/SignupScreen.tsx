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

export function SignupScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Signup">) {
  const { signup } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSignup() {
    setBusy(true);
    setError(null);
    try {
      await signup(name, email, password);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenShell>
      <BrandHeroCard
        eyebrow="Cross-device account setup"
        title="Create your account"
        body="Start on mobile, verify once, and continue with the same MANABU identity across web and app."
      />
      <Card>
        <View style={{ gap: 12 }}>
          <Input label="Display name" value={name} onChangeText={setName} placeholder="Enter your full name" />
          <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Enter your email" />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Create a strong password" />
          {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
          <Button title={busy ? "Creating account..." : "Sign up"} onPress={() => void handleSignup()} disabled={busy} />
          <Button title="Back to login" variant="ghost" onPress={() => navigation.navigate("Login")} />
        </View>
      </Card>
    </ScreenShell>
  );
}
