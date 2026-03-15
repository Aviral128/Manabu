import React from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "../theme/tokens";

export function BrandLaunchOverlay({ onDone }: { onDone: () => void }) {
  const shellOpacity = React.useRef(new Animated.Value(1)).current;
  const shellScale = React.useRef(new Animated.Value(0.96)).current;
  const titleOpacity = React.useRef(new Animated.Value(0)).current;
  const titleOffset = React.useRef(new Animated.Value(22)).current;
  const ringRotation = React.useRef(new Animated.Value(0)).current;
  const beamShift = React.useRef(new Animated.Value(-170)).current;
  const haloPulse = React.useRef(new Animated.Value(0.74)).current;

  React.useEffect(() => {
    const rotationLoop = Animated.loop(
      Animated.timing(ringRotation, {
        toValue: 1,
        duration: 5200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const beamLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(beamShift, {
          toValue: 210,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(beamShift, {
          toValue: -170,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(haloPulse, {
          toValue: 0.8,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    rotationLoop.start();
    beamLoop.start();
    haloLoop.start();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(shellScale, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(titleOffset, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1750),
      Animated.parallel([
        Animated.timing(shellOpacity, {
          toValue: 0,
          duration: 480,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shellScale, {
          toValue: 1.03,
          duration: 480,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      rotationLoop.stop();
      beamLoop.stop();
      haloLoop.stop();
      if (finished) {
        onDone();
      }
    });

    return () => {
      rotationLoop.stop();
      beamLoop.stop();
      haloLoop.stop();
    };
  }, [beamShift, haloPulse, onDone, ringRotation, shellOpacity, shellScale, titleOffset, titleOpacity]);

  const ringSpin = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.root, { opacity: shellOpacity }]}>
      <LinearGradient colors={["#030915", "#091321", "#06101D"]} style={StyleSheet.absoluteFillObject} />
      <View pointerEvents="none" style={styles.gridLayer} />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.beam,
          {
            transform: [{ translateX: beamShift }, { rotate: "16deg" }],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.beamSecondary,
          {
            transform: [{ translateX: beamShift.interpolate({ inputRange: [-170, 210], outputRange: [120, -90] }) }, { rotate: "-18deg" }],
          },
        ]}
      />

      <Animated.View style={[styles.card, { transform: [{ scale: shellScale }] }]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.halo,
            {
              transform: [{ scale: haloPulse }],
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.orbit,
            {
              transform: [{ rotate: ringSpin }],
            },
          ]}
        />
        <Animated.View pointerEvents="none" style={styles.orbitEcho} />

        <View style={styles.signalRow}>
          {["Adaptive engine", "Human rhythm", "Daily velocity"].map((signal) => (
            <View key={signal} style={styles.signalPill}>
              <Text style={styles.signalText}>{signal}</Text>
            </View>
          ))}
        </View>

        <Animated.Text style={[styles.brand, { opacity: titleOpacity, transform: [{ translateY: titleOffset }] }]}>
          MANABU
        </Animated.Text>
        <Animated.Text style={[styles.caption, { opacity: titleOpacity, transform: [{ translateY: titleOffset }] }]}>
          Learn with rhythm, not chaos.
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#06101D",
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  beam: {
    position: "absolute",
    top: -80,
    bottom: -80,
    width: 132,
    backgroundColor: "rgba(73, 183, 255, 0.22)",
    shadowColor: "#49B7FF",
    shadowOpacity: 0.34,
    shadowRadius: 24,
  },
  beamSecondary: {
    position: "absolute",
    top: -120,
    bottom: -120,
    width: 110,
    backgroundColor: "rgba(253, 186, 77, 0.12)",
    shadowColor: "#FDBA4D",
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    minHeight: 360,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(156, 180, 209, 0.16)",
    backgroundColor: "rgba(8, 18, 33, 0.88)",
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  halo: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 999,
    backgroundColor: "rgba(73, 183, 255, 0.16)",
  },
  orbit: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(73, 183, 255, 0.16)",
  },
  orbitEcho: {
    position: "absolute",
    width: 296,
    height: 296,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(103, 232, 249, 0.08)",
  },
  signalRow: {
    position: "absolute",
    top: 30,
    left: 18,
    right: 18,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  signalPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(156, 180, 209, 0.16)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  signalText: {
    color: "#B8D3EE",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  brand: {
    color: "#EFF7FF",
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 4.2,
    textAlign: "center",
  },
  caption: {
    marginTop: 12,
    color: "#C4D8F2",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 260,
  },
});
