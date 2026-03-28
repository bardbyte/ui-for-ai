"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface StreamingLayoutProps {
  className?: string;
  children: ReactNode;
  /** Spring physics for resize animation. */
  spring?: { stiffness?: number; damping?: number; mass?: number };
}

const defaultSpring = { stiffness: 200, damping: 25, mass: 0.5 };

/**
 * Container that smoothly adjusts height as streaming content grows.
 * Uses Motion layout animation with spring physics for natural "breathing"
 * instead of janky reflows.
 */
export function StreamingLayout({
  className,
  children,
  spring: springConfig,
}: StreamingLayoutProps) {
  const prefersReduced = useReducedMotion();
  const s = { ...defaultSpring, ...springConfig };

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      layout="size"
      className={className}
      transition={{
        layout: {
          type: "spring",
          ...s,
        },
      }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
}
