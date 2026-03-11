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

export function SignupScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Signup">) {
  const { signup } = useAuth();
  const [name, setName] = React.useState("Learner Demo");
  const [email, setEmail] = React.useState("newlearner@manabu.app");
  const [password, setPassword] = React.useState("StrongPass123");
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
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Text style={{ color: theme.colors.text, fontSize: 32, fontWeight: "800" }}>Create your account</Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 10 }}>
          Start with a real profile stored in the MANABU backend and continue across web and mobile.
        </Text>
      </Card>
      <Card>
        <View style={{ gap: 12 }}>
          <Input label="Display name" value={name} onChangeText={setName} />
          <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          {error ? <Text style={{ color: theme.colors.danger }}>{error}</Text> : null}
          <Button title={busy ? "Creating account..." : "Sign up"} onPress={() => void handleSignup()} disabled={busy} />
          <Button title="Back to login" variant="ghost" onPress={() => navigation.navigate("Login")} />
        </View>
      </Card>
    </ScreenShell>
  );
}
