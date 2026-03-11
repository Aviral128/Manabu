import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { theme } from "../theme/tokens";

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        variant === "primary" ? styles.primary : styles.ghost,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, variant === "ghost" && styles.ghostLabel]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: theme.colors.border,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: "#07111F",
    fontWeight: "800",
    fontSize: 16,
  },
  ghostLabel: {
    color: theme.colors.text,
  },
});
