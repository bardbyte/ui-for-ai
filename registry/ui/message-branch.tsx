"use client";

import type { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface MessageBranchProps {
  /** Total number of branches (regenerated responses). */
  total: number;
  /** Currently active branch (1-indexed). */
  current: number;
  /** Callback when user navigates to a different branch. */
  onBranchChange: (branch: number) => void;
  /** The content of the current branch. */
  children: ReactNode;
  className?: string;
}

/**
 * Response regeneration navigation.
 *
 * Shows "2 of 3" with Previous/Next arrows. Content cross-fades between
 * branches with directional slide. Essential for any AI chat with regenerate.
 */
export function MessageBranch({
  total,
  current,
  onBranchChange,
  children,
  className,
}: MessageBranchProps) {
  const prefersReduced = useReducedMotion();

  if (total <= 1) {
    return <div className={className}>{children}</div>;
  }

  const canPrev = current > 1;
  const canNext = current < total;

  const navButton = (direction: "prev" | "next", disabled: boolean) => (
    <button
      type="button"
      onClick={() =>
        onBranchChange(direction === "prev" ? current - 1 : current + 1)
      }
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous response" : "Next response"}
      style={{
        width: 24,
        height: 24,
        borderRadius: 6,
        border: "1px solid oklch(0.22 0.01 260 / 0.4)",
        background: disabled
          ? "oklch(0.10 0.005 260 / 0.3)"
          : "oklch(0.14 0.008 260 / 0.7)",
        color: disabled ? "oklch(0.30 0.01 260)" : "oklch(0.65 0.01 260)",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 150ms, border-color 150ms",
      }}
    >
      <svg
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {direction === "prev" ? (
          <polyline points="15 18 9 12 15 6" />
        ) : (
          <polyline points="9 6 15 12 9 18" />
        )}
      </svg>
    </button>
  );

  return (
    <div className={className}>
      {/* Content with cross-fade */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          initial={
            prefersReduced
              ? undefined
              : { opacity: 0, x: 8 }
          }
          animate={{ opacity: 1, x: 0 }}
          exit={
            prefersReduced
              ? undefined
              : { opacity: 0, x: -8 }
          }
          transition={prefersReduced ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Navigation bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginTop: 8,
        }}
      >
        {navButton("prev", !canPrev)}
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-geist-mono, monospace)",
            color: "oklch(0.50 0.01 260)",
            minWidth: 40,
            textAlign: "center",
          }}
        >
          {current} / {total}
        </span>
        {navButton("next", !canNext)}
      </div>
    </div>
  );
}
