import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "../theme/tokens";

export function BrandHeroCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <LinearGradient
      colors={["rgba(10, 22, 40, 0.98)", "rgba(16, 35, 61, 0.94)", "rgba(9, 18, 34, 0.98)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.shell}
    >
      <View style={styles.backdropHalo} />
      <View style={styles.orbitOuter} />
      <View style={styles.orbitInner} />

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.brand}>MANABU</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>

        <View style={styles.signalRow}>
          {["Adaptive", "Focused", "Synced"].map((signal) => (
            <View key={signal} style={styles.signalPill}>
              <Text style={styles.signalText}>{signal}</Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(156, 180, 209, 0.18)",
    overflow: "hidden",
  },
  backdropHalo: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 999,
    right: -90,
    top: -120,
    backgroundColor: "rgba(73, 183, 255, 0.18)",
  },
  orbitOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(73, 183, 255, 0.14)",
    right: -70,
    top: -82,
  },
  orbitInner: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(103, 232, 249, 0.2)",
    right: -34,
    top: -44,
  },
  copy: {
    gap: 12,
  },
  eyebrow: {
    color: "#9CCEF8",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  brand: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
    maxWidth: 260,
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 300,
  },
  signalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  signalPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(156, 180, 209, 0.14)",
  },
  signalText: {
    color: "#B8D3EE",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
