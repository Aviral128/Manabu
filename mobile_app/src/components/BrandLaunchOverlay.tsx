import React from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const launchSignals = ["Signal scan", "Adaptive engine", "Momentum sync"];
const orbitBadges = ["AI tuned", "Live practice", "Daily rhythm"];
const launchStages = [
  {
    label: "Phase 01",
    title: "Read the learner pulse",
    description: "Map intent and recent momentum.",
  },
  {
    label: "Phase 02",
    title: "Build the session arc",
    description: "Shape pacing and next-question flow.",
  },
  {
    label: "Phase 03",
    title: "Open the feedback loop",
    description: "Push the learner into action fast.",
  },
];
const statusFacts = [
  { label: "Runtime", value: "Live stack" },
  { label: "Mode", value: "Adaptive launch" },
  { label: "Delivery", value: "Web + mobile" },
];

export function BrandLaunchOverlay({ onDone }: { onDone: () => void }) {
  const shellOpacity = React.useRef(new Animated.Value(1)).current;
  const shellScale = React.useRef(new Animated.Value(0.95)).current;
  const shellOffset = React.useRef(new Animated.Value(24)).current;
  const contentOpacity = React.useRef(new Animated.Value(0)).current;
  const titleOffset = React.useRef(new Animated.Value(20)).current;
  const ringRotation = React.useRef(new Animated.Value(0)).current;
  const beamShift = React.useRef(new Animated.Value(-180)).current;
  const haloPulse = React.useRef(new Animated.Value(0.86)).current;
  const progressValue = React.useRef(new Animated.Value(0)).current;
  const scanShift = React.useRef(new Animated.Value(-96)).current;
  const [activeStage, setActiveStage] = React.useState(0);

  React.useEffect(() => {
    const rotationLoop = Animated.loop(
      Animated.timing(ringRotation, {
        toValue: 1,
        duration: 5600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const beamLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(beamShift, {
          toValue: 220,
          duration: 1850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(beamShift, {
          toValue: -180,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulse, {
          toValue: 1.04,
          duration: 980,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(haloPulse, {
          toValue: 0.88,
          duration: 980,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanShift, {
          toValue: 96,
          duration: 1650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanShift, {
          toValue: -96,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    rotationLoop.start();
    beamLoop.start();
    haloLoop.start();
    scanLoop.start();

    const stageTimers = [620, 1520, 2400].map((delay, index) =>
      setTimeout(() => {
        setActiveStage(index);
      }, delay),
    );

    Animated.sequence([
      Animated.parallel([
        Animated.timing(shellScale, {
          toValue: 1,
          duration: 460,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shellOffset, {
          toValue: 0,
          duration: 460,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(titleOffset, {
          toValue: 0,
          duration: 440,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progressValue, {
          toValue: 1,
          duration: 2700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(450),
      Animated.parallel([
        Animated.timing(shellOpacity, {
          toValue: 0,
          duration: 520,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shellScale, {
          toValue: 1.03,
          duration: 520,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      rotationLoop.stop();
      beamLoop.stop();
      haloLoop.stop();
      scanLoop.stop();
      stageTimers.forEach(clearTimeout);
      if (finished) {
        onDone();
      }
    });

    return () => {
      rotationLoop.stop();
      beamLoop.stop();
      haloLoop.stop();
      scanLoop.stop();
      stageTimers.forEach(clearTimeout);
    };
  }, [
    beamShift,
    contentOpacity,
    haloPulse,
    onDone,
    progressValue,
    ringRotation,
    scanShift,
    shellOffset,
    shellOpacity,
    shellScale,
    titleOffset,
  ]);

  const ringSpin = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const secondaryRingSpin = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });
  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["12%", "100%"],
  });

  return (
    <Animated.View style={[styles.root, { opacity: shellOpacity }]}>
      <LinearGradient colors={["#020712", "#07121F", "#07101C"]} style={StyleSheet.absoluteFillObject} />
      <View pointerEvents="none" style={styles.gridLayer} />
      <View pointerEvents="none" style={styles.gridMask} />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.beam,
          {
            transform: [{ translateX: beamShift }, { rotate: "14deg" }],
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.beamSecondary,
          {
            transform: [
              { translateX: beamShift.interpolate({ inputRange: [-180, 220], outputRange: [120, -110] }) },
              { rotate: "-18deg" },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateY: shellOffset }, { scale: shellScale }],
          },
        ]}
      >
        <LinearGradient colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0)", "rgba(56,189,248,0.08)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGlow} />

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
        <Animated.View
          pointerEvents="none"
          style={[
            styles.orbitEcho,
            {
              transform: [{ rotate: secondaryRingSpin }],
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.scanLine,
            {
              transform: [{ translateY: scanShift }],
            },
          ]}
        />

        <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
          <View style={styles.topRow}>
            <View style={styles.tagPill}>
              <Text style={styles.tagPillText}>MANABU launch sequence</Text>
            </View>
            <Text style={styles.statusText}>Adaptive learning online</Text>
          </View>

          <View style={styles.signalWrap}>
            {launchSignals.map((signal) => (
              <View key={signal} style={styles.signalPill}>
                <Text style={styles.signalText}>{signal}</Text>
              </View>
            ))}
          </View>

          <Animated.Text style={[styles.kicker, { transform: [{ translateY: titleOffset }] }]}>
            Learn with rhythm, not chaos
          </Animated.Text>
          <Animated.Text style={[styles.brand, { transform: [{ translateY: titleOffset }] }]}>
            MANABU
          </Animated.Text>
          <Animated.Text style={[styles.caption, { transform: [{ translateY: titleOffset }] }]}>
            Adaptive practice, live analytics, and a sharper first move are being staged before the learner enters.
          </Animated.Text>

          <View style={styles.coreWrap}>
            <View style={styles.core}>
              <Text style={styles.coreLabel}>Current stage</Text>
              <Text style={styles.coreValue}>{activeStage + 1}/3</Text>
              <Text style={styles.coreStage}>{launchStages[activeStage]?.label}</Text>
            </View>
            <View style={[styles.orbitBadge, styles.orbitBadgeTop]}>
              <Text style={styles.orbitBadgeText}>{orbitBadges[0]}</Text>
            </View>
            <View style={[styles.orbitBadge, styles.orbitBadgeRight]}>
              <Text style={styles.orbitBadgeText}>{orbitBadges[1]}</Text>
            </View>
            <View style={[styles.orbitBadge, styles.orbitBadgeLeft]}>
              <Text style={styles.orbitBadgeText}>{orbitBadges[2]}</Text>
            </View>
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Sequence progress</Text>
            <Text style={styles.progressValue}>{launchStages[activeStage]?.title}</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>

          <View style={styles.stageGrid}>
            {launchStages.map((stage, index) => {
              const isActive = index === activeStage;
              const isPassed = index < activeStage;
              return (
                <View
                  key={stage.label}
                  style={[
                    styles.stageCard,
                    isActive ? styles.stageCardActive : undefined,
                    !isActive && isPassed ? styles.stageCardPassed : undefined,
                  ]}
                >
                  <Text style={styles.stageLabel}>{stage.label}</Text>
                  <Text style={styles.stageTitle}>{stage.title}</Text>
                  <Text style={styles.stageDescription}>{stage.description}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.factGrid}>
            {statusFacts.map((fact) => (
              <View key={fact.label} style={styles.factCard}>
                <Text style={styles.factLabel}>{fact.label}</Text>
                <Text style={styles.factValue}>{fact.value}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
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
    padding: 18,
    backgroundColor: "#07101C",
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  gridMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 16, 28, 0.34)",
  },
  beam: {
    position: "absolute",
    top: -90,
    bottom: -90,
    width: 144,
    backgroundColor: "rgba(56, 189, 248, 0.2)",
    shadowColor: "#38BDF8",
    shadowOpacity: 0.34,
    shadowRadius: 26,
  },
  beamSecondary: {
    position: "absolute",
    top: -120,
    bottom: -120,
    width: 116,
    backgroundColor: "rgba(251, 191, 36, 0.12)",
    shadowColor: "#FBBF24",
    shadowOpacity: 0.24,
    shadowRadius: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(156, 180, 209, 0.16)",
    backgroundColor: "rgba(7, 17, 31, 0.94)",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    overflow: "hidden",
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  halo: {
    position: "absolute",
    top: 112,
    alignSelf: "center",
    width: 228,
    height: 228,
    borderRadius: 999,
    backgroundColor: "rgba(56, 189, 248, 0.14)",
  },
  orbit: {
    position: "absolute",
    top: 108,
    alignSelf: "center",
    width: 232,
    height: 232,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(103, 232, 249, 0.16)",
  },
  orbitEcho: {
    position: "absolute",
    top: 92,
    alignSelf: "center",
    width: 264,
    height: 264,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.08)",
  },
  scanLine: {
    position: "absolute",
    top: 214,
    alignSelf: "center",
    width: 210,
    height: 2,
    backgroundColor: "rgba(103, 232, 249, 0.82)",
    opacity: 0.7,
  },
  content: {
    position: "relative",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(156, 180, 209, 0.16)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  tagPillText: {
    color: "#D7E7FB",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  statusText: {
    color: "#89A6C9",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.3,
    textTransform: "uppercase",
    maxWidth: 120,
    textAlign: "right",
  },
  signalWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  signalPill: {
    marginRight: 8,
    marginBottom: 8,
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
  kicker: {
    color: "#89A6C9",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  brand: {
    color: "#EFF7FF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 3.8,
    textAlign: "left",
  },
  caption: {
    marginTop: 10,
    color: "#C4D8F2",
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 290,
  },
  coreWrap: {
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  core: {
    width: 144,
    height: 144,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(232, 243, 255, 0.12)",
    backgroundColor: "rgba(8, 20, 35, 0.88)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#02111E",
    shadowOpacity: 0.42,
    shadowRadius: 26,
    elevation: 10,
  },
  coreLabel: {
    color: "#89A6C9",
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  coreValue: {
    color: "#EFF7FF",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 6,
  },
  coreStage: {
    color: "#B9D2EF",
    fontSize: 11,
    marginTop: 4,
  },
  orbitBadge: {
    position: "absolute",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(156, 180, 209, 0.16)",
    backgroundColor: "rgba(8, 20, 35, 0.78)",
  },
  orbitBadgeTop: {
    top: 18,
    right: 32,
  },
  orbitBadgeRight: {
    bottom: 38,
    right: 10,
  },
  orbitBadgeLeft: {
    bottom: 26,
    left: 10,
  },
  orbitBadgeText: {
    color: "#E7F5FF",
    fontSize: 11,
    fontWeight: "800",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressLabel: {
    color: "#89A6C9",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  progressValue: {
    color: "#EEF6FF",
    fontSize: 11,
    fontWeight: "800",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 10,
  },
  progressTrack: {
    height: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#38BDF8",
  },
  stageGrid: {
    marginTop: 14,
  },
  stageCard: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(232, 243, 255, 0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    marginBottom: 10,
  },
  stageCardActive: {
    borderColor: "rgba(103, 232, 249, 0.34)",
    backgroundColor: "rgba(56, 189, 248, 0.14)",
  },
  stageCardPassed: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  stageLabel: {
    color: "#89A6C9",
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  stageTitle: {
    color: "#EEF6FF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 7,
  },
  stageDescription: {
    color: "#B9D2EF",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  factGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 2,
  },
  factCard: {
    width: "31%",
    minWidth: 96,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(232, 243, 255, 0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    marginBottom: 8,
  },
  factLabel: {
    color: "#89A6C9",
    fontSize: 10,
  },
  factValue: {
    color: "#EEF6FF",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 6,
  },
});
