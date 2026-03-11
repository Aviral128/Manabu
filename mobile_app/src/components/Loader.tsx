import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { theme } from "../theme/tokens";

export function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", gap: 12, padding: theme.spacing.xl }}>
      <ActivityIndicator size="small" color={theme.colors.primary} />
      <Text style={{ color: theme.colors.textMuted }}>{label}</Text>
    </View>
  );
}
