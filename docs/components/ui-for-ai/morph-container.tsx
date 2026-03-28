"use client";

import type { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface MorphContainerProps {
  /** Active view key. Changing this triggers the transition. */
  activeView: string;
  /** Transition style. Defaults to "crossfade". */
  transition?: "crossfade" | "slide" | "scale";
  children: ReactNode;
  className?: string;
}

const transitionVariants = {
  crossfade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.25 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { type: "spring" as const, stiffness: 300, damping: 28 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { type: "spring" as const, stiffness: 400, damping: 30 },
  },
};

/**
 * Smooth animated transitions between different content views.
 * Use for switching between chat, canvas, code, and artifact views.
 *
 * Change `activeView` to trigger a transition. The children rendered
 * at the time of the transition will crossfade/slide/scale.
 */
export function MorphContainer({
  activeView,
  transition: transitionType = "crossfade",
  children,
  className,
}: MorphContainerProps) {
  const prefersReduced = useReducedMotion();
  const v = transitionVariants[transitionType];

  if (prefersReduced) {
    return (
      <div className={className} aria-live="polite">
        {children}
      </div>
    );
  }

  return (
    <div
      className={className}
      aria-live="polite"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeView}
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
          transition={v.transition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
