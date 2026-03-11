import React from "react";
import { Text, View } from "react-native";

import { Button } from "./Button";
import { reportMobileError } from "../services/monitoring";
import { theme } from "../theme/tokens";

type State = { hasError: boolean };

export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    void reportMobileError(error, { type: "react.error-boundary" });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            alignItems: "center",
            justifyContent: "center",
            padding: theme.spacing.xl,
            gap: theme.spacing.md,
          }}
        >
          <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "800" }}>Something broke</Text>
          <Text style={{ color: theme.colors.textMuted, textAlign: "center" }}>
            The mobile app hit an unexpected error. Restart the session to recover safely.
          </Text>
          <Button title="Reset app" onPress={() => this.setState({ hasError: false })} />
        </View>
      );
    }

    return this.props.children;
  }
}
