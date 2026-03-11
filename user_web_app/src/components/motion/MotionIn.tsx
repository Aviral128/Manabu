"use client";

import { motion, useReducedMotion } from "framer-motion";
import React from "react";

export function MotionIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }): JSX.Element {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
