"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import React from "react";

const launchSignals = ["Adaptive engine", "Human rhythm", "Daily velocity"];
const titleLetters = Array.from("MANABU");

export function BrandLaunchOverlay(): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setVisible(false);
    }, prefersReducedMotion ? 500 : 2600);

    return () => window.clearTimeout(timeout);
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.03 }}
          transition={{ duration: prefersReducedMotion ? 0.15 : 0.5, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            overflow: "hidden",
            background:
              "radial-gradient(circle at 50% 20%, rgba(73, 183, 255, 0.2), transparent 26%), radial-gradient(circle at 84% 18%, rgba(103, 232, 249, 0.18), transparent 24%), radial-gradient(circle at 18% 82%, rgba(253, 186, 77, 0.16), transparent 22%), linear-gradient(180deg, #030915, #091321 58%, #06101d)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
              backgroundSize: "54px 54px",
              opacity: 0.24,
              maskImage: "radial-gradient(circle at center, black 38%, transparent 86%)",
            }}
          />

          <motion.div
            aria-hidden="true"
            animate={prefersReducedMotion ? {} : { x: ["-18%", "24%"], opacity: [0.2, 0.48, 0.2] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: "-8%",
              bottom: "-8%",
              left: "-18%",
              width: "32%",
              background: "linear-gradient(180deg, rgba(73, 183, 255, 0), rgba(73, 183, 255, 0.34), rgba(103, 232, 249, 0))",
              filter: "blur(10px)",
              transform: "rotate(15deg)",
            }}
          />
          <motion.div
            aria-hidden="true"
            animate={prefersReducedMotion ? {} : { x: ["18%", "-20%"], opacity: [0.14, 0.32, 0.14] }}
            transition={{ duration: 2.1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.2 }}
            style={{
              position: "absolute",
              top: "-10%",
              bottom: "-10%",
              right: "-12%",
              width: "26%",
              background: "linear-gradient(180deg, rgba(253, 186, 77, 0), rgba(253, 186, 77, 0.24), rgba(103, 232, 249, 0))",
              filter: "blur(14px)",
              transform: "rotate(-18deg)",
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
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: prefersReducedMotion ? 0.15 : 0.6, ease: "easeOut" }}
              style={{
                width: "min(760px, 100%)",
                borderRadius: 36,
                border: "1px solid rgba(232, 243, 255, 0.12)",
                background:
                  "linear-gradient(145deg, rgba(7, 17, 31, 0.92), rgba(12, 29, 52, 0.82) 54%, rgba(8, 18, 33, 0.94))",
                boxShadow: "0 36px 120px rgba(1, 7, 15, 0.52)",
                padding: "28px 24px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <motion.div
                aria-hidden="true"
                animate={prefersReducedMotion ? {} : { rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute",
                  inset: "14% auto auto 50%",
                  width: 260,
                  height: 260,
                  marginLeft: -130,
                  borderRadius: "50%",
                  border: "1px solid rgba(73, 183, 255, 0.18)",
                  boxShadow: "0 0 0 24px rgba(73, 183, 255, 0.04), 0 0 0 56px rgba(103, 232, 249, 0.03)",
                }}
              />

              <div style={{ position: "relative", display: "grid", gap: 18, textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-flex",
                    gap: 8,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {launchSignals.map((signal, index) => (
                    <motion.span
                      key={signal}
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: prefersReducedMotion ? 0 : 0.18 + index * 0.08, duration: 0.35, ease: "easeOut" }}
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

                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                  {titleLetters.map((letter, index) => (
                    <motion.span
                      key={`${letter}-${index}`}
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 26, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ delay: prefersReducedMotion ? 0 : 0.32 + index * 0.06, duration: 0.4, ease: "easeOut" }}
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 900,
                        fontSize: "clamp(2.6rem, 10vw, 5.6rem)",
                        lineHeight: 0.94,
                        letterSpacing: "0.08em",
                        color: "#eff7ff",
                        textShadow: "0 0 24px rgba(73, 183, 255, 0.2)",
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>

                <motion.p
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: prefersReducedMotion ? 0 : 0.84, duration: 0.4, ease: "easeOut" }}
                  style={{
                    margin: 0,
                    color: "#c4d8f2",
                    fontSize: "clamp(1rem, 2vw, 1.2rem)",
                    maxWidth: 560,
                    justifySelf: "center",
                  }}
                >
                  Learn with rhythm, not chaos. Adaptive practice, AI guidance, and momentum you can feel from the first frame.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
