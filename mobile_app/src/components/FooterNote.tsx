import React from "react";
import { Text } from "react-native";

import { theme } from "../theme/tokens";

export function FooterNote() {
  return (
    <Text style={{ color: theme.colors.textMuted, textAlign: "center", fontSize: 12, marginTop: theme.spacing.lg }}>
      Created with ❤️ by Aviral Sultaniya
    </Text>
  );
}
