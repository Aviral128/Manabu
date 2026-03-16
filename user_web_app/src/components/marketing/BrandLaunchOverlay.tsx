"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import React from "react";

const launchSignals = ["Create account", "Generate quizzes", "Improve mastery"];
const orbitBadges = ["AI quizzes", "Adaptive flow", "Progress tracking"];
const titleLetters = Array.from("MANABU");
const launchStages = [
  {
    label: "Step 01",
    title: "Create your account",
    description: "Sign up and verify your email in minutes.",
  },
  {
    label: "Step 02",
    title: "Generate quizzes",
    description: "Build a session with AI-powered question banks.",
  },
  {
    label: "Step 03",
    title: "Improve your learning",
    description: "Review results, focus weak spots, and grow mastery.",
  },
];
const statusFacts = [
  { label: "Platform", value: "Web + mobile" },
  { label: "Engine", value: "AI quiz builder" },
  { label: "Mode", value: "Adaptive practice" },
];
const particles = [
  { top: "12%", left: "15%", size: 6, delay: 0.1, duration: 3.4 },
  { top: "20%", left: "82%", size: 8, delay: 0.45, duration: 4 },
  { top: "38%", left: "10%", size: 5, delay: 0.3, duration: 3.1 },
  { top: "62%", left: "88%", size: 7, delay: 0.2, duration: 3.7 },
  { top: "74%", left: "16%", size: 9, delay: 0.58, duration: 4.1 },
  { top: "86%", left: "74%", size: 5, delay: 0.74, duration: 3.3 },
];

export function BrandLaunchOverlay(): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = React.useState(true);
  const [activeStage, setActiveStage] = React.useState(prefersReducedMotion ? launchStages.length - 1 : 0);

  React.useEffect(() => {
    if (prefersReducedMotion) {
      const timeout = window.setTimeout(() => {
        setVisible(false);
      }, 850);

      return () => window.clearTimeout(timeout);
    }

    const stageTimers = [650, 1550, 2500].map((delay, index) =>
      window.setTimeout(() => {
        setActiveStage(index);
      }, delay),
    );
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 3850);

    return () => {
      stageTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(hideTimer);
    };
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.02 }}
          transition={{ duration: prefersReducedMotion ? 0.18 : 0.55, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            overflow: "hidden",
            background:
              "radial-gradient(circle at 50% 14%, rgba(56, 189, 248, 0.24), transparent 24%), radial-gradient(circle at 82% 18%, rgba(45, 212, 191, 0.18), transparent 24%), radial-gradient(circle at 14% 82%, rgba(251, 191, 36, 0.14), transparent 24%), linear-gradient(180deg, #020712, #07121f 54%, #07101c)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              opacity: 0.22,
              maskImage: "radial-gradient(circle at center, black 34%, transparent 92%)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 16%), radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.12), transparent 34%)",
              opacity: 0.4,
            }}
          />

          {particles.map((particle, index) => (
            <motion.span
              key={`${particle.left}_${particle.top}`}
              aria-hidden="true"
              initial={prefersReducedMotion ? { opacity: 0.2 } : { opacity: 0, scale: 0.8, y: 0 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0.24 }
                  : { opacity: [0.1, 0.52, 0.12], scale: [0.85, 1.2, 0.92], y: [0, -16, 0] }
              }
              transition={{
                delay: particle.delay,
                duration: particle.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                top: particle.top,
                left: particle.left,
                width: particle.size,
                height: particle.size,
                borderRadius: "50%",
                background: index % 2 === 0 ? "rgba(103, 232, 249, 0.94)" : "rgba(251, 191, 36, 0.85)",
                boxShadow: "0 0 18px rgba(103, 232, 249, 0.42)",
              }}
            />
          ))}

          <motion.div
            aria-hidden="true"
            animate={prefersReducedMotion ? {} : { x: ["-18%", "26%"], opacity: [0.16, 0.54, 0.16] }}
            transition={{ duration: 2.3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: "-10%",
              bottom: "-10%",
              left: "-14%",
              width: "32%",
              background: "linear-gradient(180deg, rgba(56, 189, 248, 0), rgba(56, 189, 248, 0.28), rgba(45, 212, 191, 0))",
              filter: "blur(12px)",
              transform: "rotate(14deg)",
            }}
          />
          <motion.div
            aria-hidden="true"
            animate={prefersReducedMotion ? {} : { x: ["18%", "-24%"], opacity: [0.1, 0.34, 0.1] }}
            transition={{ duration: 2.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.18 }}
            style={{
              position: "absolute",
              top: "-12%",
              bottom: "-12%",
              right: "-10%",
              width: "26%",
              background: "linear-gradient(180deg, rgba(251, 191, 36, 0), rgba(251, 191, 36, 0.18), rgba(56, 189, 248, 0))",
              filter: "blur(16px)",
              transform: "rotate(-18deg)",
            }}
          />
          <motion.div
            aria-hidden="true"
            animate={prefersReducedMotion ? {} : { y: ["-12%", "110%"], opacity: [0, 0.56, 0] }}
            transition={{ duration: 2.45, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            style={{
              position: "absolute",
              left: "10%",
              right: "10%",
              height: 2,
              background: "linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.84), transparent)",
              filter: "blur(0.5px)",
            }}
          />

          <div
            style={{
              position: "relative",
              minHeight: "100%",
              display: "grid",
              placeItems: "center",
              padding: 24,
            }}
          >
            <motion.button
              type="button"
              onClick={() => setVisible(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.82 }}
              whileHover={prefersReducedMotion ? undefined : { opacity: 1 }}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                borderRadius: 999,
                border: "1px solid rgba(232, 243, 255, 0.16)",
                background: "rgba(255,255,255,0.06)",
                color: "#d7e7fb",
                padding: "10px 14px",
                fontWeight: 800,
                letterSpacing: 0.2,
                cursor: "pointer",
              }}
            >
              Skip intro
            </motion.button>

            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: prefersReducedMotion ? 0.18 : 0.62, ease: "easeOut" }}
              style={{
                width: "min(1040px, 100%)",
                borderRadius: 40,
                border: "1px solid rgba(232, 243, 255, 0.14)",
                background:
                  "linear-gradient(145deg, rgba(5, 15, 27, 0.95), rgba(9, 24, 42, 0.9) 42%, rgba(6, 16, 29, 0.96))",
                boxShadow: "0 40px 140px rgba(1, 7, 15, 0.56)",
                padding: "24px 24px 22px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(125deg, rgba(255,255,255,0.05), transparent 34%), radial-gradient(circle at 22% 22%, rgba(45, 212, 191, 0.08), transparent 28%), radial-gradient(circle at 74% 30%, rgba(56, 189, 248, 0.14), transparent 32%)",
                }}
              />
              <motion.div
                aria-hidden="true"
                animate={prefersReducedMotion ? {} : { rotate: 360 }}
                transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute",
                  top: "16%",
                  right: "13%",
                  width: 320,
                  height: 320,
                  borderRadius: "50%",
                  border: "1px solid rgba(56, 189, 248, 0.14)",
                  boxShadow: "0 0 0 18px rgba(56, 189, 248, 0.03), 0 0 0 52px rgba(45, 212, 191, 0.03)",
                }}
              />

              <div style={{ position: "relative", display: "grid", gap: 22 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <motion.div
                    initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 0.12, duration: 0.35, ease: "easeOut" }}
                    style={{
                      padding: "9px 13px",
                      borderRadius: 999,
                      border: "1px solid rgba(232, 243, 255, 0.12)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#d7e7fb",
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: 0.4,
                    }}
                  >
                    MANABU launch sequence
                  </motion.div>
                  <motion.div
                    initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : 0.18, duration: 0.35, ease: "easeOut" }}
                    style={{
                      color: "#89a6c9",
                      fontSize: 12,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                    }}
                  >
                    System online · adaptive learning ready
                  </motion.div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
                    gap: 22,
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "grid", gap: 16 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {launchSignals.map((signal, index) => (
                        <motion.span
                          key={signal}
                          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: prefersReducedMotion ? 0 : 0.2 + index * 0.08, duration: 0.35, ease: "easeOut" }}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 999,
                            border: "1px solid rgba(232, 243, 255, 0.12)",
                            background: "rgba(255,255,255,0.05)",
                            color: "#b9d2ef",
                            fontWeight: 700,
                            fontSize: 13,
                            letterSpacing: 0.3,
                          }}
                        >
                          {signal}
                        </motion.span>
                      ))}
                    </div>

                    <motion.div
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: prefersReducedMotion ? 0 : 0.36, duration: 0.38, ease: "easeOut" }}
                      style={{
                        color: "#89a6c9",
                        fontSize: 12,
                        letterSpacing: 2.8,
                        textTransform: "uppercase",
                      }}
                    >
                      Learn with rhythm, not chaos
                    </motion.div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {titleLetters.map((letter, index) => (
                        <motion.span
                          key={`${letter}-${index}`}
                          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 26, filter: "blur(10px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          transition={{ delay: prefersReducedMotion ? 0 : 0.42 + index * 0.06, duration: 0.42, ease: "easeOut" }}
                          style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 900,
                            fontSize: "clamp(2.8rem, 9vw, 6rem)",
                            lineHeight: 0.94,
                            letterSpacing: "0.08em",
                            color: "#eff7ff",
                            textShadow: "0 0 28px rgba(56, 189, 248, 0.24)",
                          }}
                        >
                          {letter}
                        </motion.span>
                      ))}
                    </div>

                    <motion.p
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: prefersReducedMotion ? 0 : 0.92, duration: 0.42, ease: "easeOut" }}
                      style={{
                        margin: 0,
                        color: "#c4d8f2",
                        fontSize: "clamp(1rem, 2vw, 1.16rem)",
                        maxWidth: 560,
                        lineHeight: 1.55,
                      }}
                    >
                      Adaptive practice, live analytics, and a sharper first move are being staged so the product feels
                      active before the learner even clicks.
                    </motion.p>

                    <motion.div
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: prefersReducedMotion ? 0 : 1.02, duration: 0.38, ease: "easeOut" }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 10,
                        maxWidth: 560,
                      }}
                    >
                      {statusFacts.map((fact) => (
                        <div
                          key={fact.label}
                          style={{
                            padding: "12px 14px",
                            borderRadius: 18,
                            border: "1px solid rgba(232, 243, 255, 0.1)",
                            background: "rgba(255,255,255,0.04)",
                          }}
                        >
                          <div style={{ color: "#89a6c9", fontSize: 11, letterSpacing: 0.5 }}>{fact.label}</div>
                          <div style={{ color: "#eef6ff", fontWeight: 900, marginTop: 6 }}>{fact.value}</div>
                        </div>
                      ))}
                    </motion.div>
                  </div>

                  <div
                    style={{
                      position: "relative",
                      minHeight: 336,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <motion.div
                      aria-hidden="true"
                      animate={prefersReducedMotion ? {} : { scale: [0.92, 1.04, 0.92], opacity: [0.18, 0.42, 0.18] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        position: "absolute",
                        width: 130,
                        height: 130,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(56, 189, 248, 0.38), rgba(56, 189, 248, 0.06) 68%, transparent 74%)",
                        filter: "blur(2px)",
                      }}
                    />
                    {[0, 1, 2, 3].map((item) => (
                      <motion.div
                        key={item}
                        aria-hidden="true"
                        animate={prefersReducedMotion ? {} : { rotate: 360 }}
                        transition={{ duration: 6 + item * 1.1, repeat: Infinity, ease: "linear" }}
                        style={{
                          position: "absolute",
                          width: 180 + item * 30,
                          height: 180 + item * 30,
                          borderRadius: "50%",
                          border: item % 2 === 0 ? "1px dashed rgba(103, 232, 249, 0.16)" : "1px solid rgba(251, 191, 36, 0.08)",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: -4,
                            left: "50%",
                            width: 8,
                            height: 8,
                            marginLeft: -4,
                            borderRadius: "50%",
                            background: item % 2 === 0 ? "rgba(103, 232, 249, 0.92)" : "rgba(251, 191, 36, 0.84)",
                            boxShadow: "0 0 14px rgba(103, 232, 249, 0.4)",
                          }}
                        />
                      </motion.div>
                    ))}
                    <motion.div
                      aria-hidden="true"
                      animate={prefersReducedMotion ? {} : { y: [-72, 72], opacity: [0, 0.65, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        position: "absolute",
                        width: 210,
                        height: 1.5,
                        background: "linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.86), transparent)",
                        filter: "blur(0.4px)",
                      }}
                    />
                    <div
                      style={{
                        position: "relative",
                        width: 156,
                        height: 156,
                        borderRadius: "50%",
                        border: "1px solid rgba(232, 243, 255, 0.12)",
                        background:
                          "radial-gradient(circle at 50% 38%, rgba(56, 189, 248, 0.3), rgba(8, 20, 35, 0.96) 66%, rgba(5, 14, 26, 0.98))",
                        boxShadow: "0 22px 54px rgba(2, 10, 20, 0.48), inset 0 0 28px rgba(56, 189, 248, 0.14)",
                        display: "grid",
                        placeItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ display: "grid", gap: 4 }}>
                        <div style={{ color: "#89a6c9", fontSize: 11, letterSpacing: 1.3, textTransform: "uppercase" }}>Current stage</div>
                        <div style={{ color: "#eff7ff", fontWeight: 900, fontSize: 22, lineHeight: 1.1 }}>{activeStage + 1}/3</div>
                        <div style={{ color: "#b9d2ef", fontSize: 12, maxWidth: 90 }}>{launchStages[activeStage]?.label}</div>
                      </div>
                    </div>

                    {orbitBadges.map((badge, index) => {
                      const positions = [
                        { top: 18, right: 16 },
                        { bottom: 34, right: -2 },
                        { bottom: 24, left: -6 },
                      ];
                      const position = positions[index];
                      return (
                        <motion.div
                          key={badge}
                          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.88 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: prefersReducedMotion ? 0 : 0.78 + index * 0.12, duration: 0.36, ease: "easeOut" }}
                          style={{
                            position: "absolute",
                            ...position,
                            padding: "10px 12px",
                            borderRadius: 16,
                            border: "1px solid rgba(232, 243, 255, 0.12)",
                            background: "rgba(8, 20, 35, 0.74)",
                            color: "#e7f5ff",
                            fontWeight: 800,
                            fontSize: 12,
                            letterSpacing: 0.2,
                            boxShadow: "0 18px 36px rgba(2, 10, 20, 0.28)",
                          }}
                        >
                          {badge}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ color: "#89a6c9", fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase" }}>
                      Sequence progress
                    </div>
                    <div style={{ color: "#eef6ff", fontSize: 13, fontWeight: 800 }}>
                      {launchStages[activeStage]?.title}
                    </div>
                  </div>

                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: prefersReducedMotion ? "100%" : "12%" }}
                      animate={{ width: `${((activeStage + 1) / launchStages.length) * 100}%` }}
                      transition={{ duration: prefersReducedMotion ? 0.01 : 0.55, ease: "easeInOut" }}
                      style={{
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(90deg, rgba(56, 189, 248, 0.9), rgba(103, 232, 249, 0.88), rgba(251, 191, 36, 0.82))",
                        boxShadow: "0 0 22px rgba(56, 189, 248, 0.32)",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
                    {launchStages.map((stage, index) => {
                      const isActive = index === activeStage;
                      const isPassed = index < activeStage;
                      return (
                        <motion.div
                          key={stage.label}
                          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                          animate={{
                            opacity: isActive || isPassed ? 1 : 0.58,
                            y: isActive ? -4 : 0,
                          }}
                          transition={{ delay: prefersReducedMotion ? 0 : 1.08 + index * 0.08, duration: 0.32, ease: "easeOut" }}
                          style={{
                            padding: "14px 14px 15px",
                            borderRadius: 20,
                            border: isActive
                              ? "1px solid rgba(103, 232, 249, 0.34)"
                              : "1px solid rgba(232, 243, 255, 0.1)",
                            background: isActive
                              ? "linear-gradient(135deg, rgba(56, 189, 248, 0.16), rgba(45, 212, 191, 0.08))"
                              : isPassed
                                ? "rgba(255,255,255,0.06)"
                                : "rgba(255,255,255,0.035)",
                            boxShadow: isActive ? "0 18px 40px rgba(5, 18, 34, 0.26)" : "none",
                          }}
                        >
                          <div style={{ color: "#89a6c9", fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase" }}>{stage.label}</div>
                          <div style={{ color: "#eef6ff", fontWeight: 900, marginTop: 8, lineHeight: 1.32 }}>{stage.title}</div>
                          <div style={{ color: "#b9d2ef", fontSize: 13, marginTop: 7, lineHeight: 1.45 }}>{stage.description}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
