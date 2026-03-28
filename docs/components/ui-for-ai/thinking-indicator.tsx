"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { AIState } from "@/hooks/use-ai-state";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface ThinkingIndicatorProps {
  /** Current AI processing state. */
  state: AIState;
  /** Optional label override per state. */
  labels?: Partial<Record<AIState, string>>;
  /** Size variant. Defaults to "md". */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const defaultLabels: Record<AIState, string> = {
  idle: "",
  thinking: "Thinking...",
  "deep-thinking": "Thinking deeply...",
  "tool-calling": "Using tools...",
  streaming: "Writing...",
  complete: "Done",
  error: "Error",
};

const sizes = {
  sm: { orb: 4, gap: 3, container: 24, fontSize: 11 },
  md: { orb: 6, gap: 4, container: 32, fontSize: 13 },
  lg: { orb: 8, gap: 5, container: 40, fontSize: 15 },
};

const stateColors: Record<AIState, string> = {
  idle: "oklch(0.6 0 0)",
  thinking: "oklch(0.7 0.15 250)",
  "deep-thinking": "oklch(0.65 0.2 280)",
  "tool-calling": "oklch(0.7 0.15 180)",
  streaming: "oklch(0.7 0.12 250)",
  complete: "oklch(0.7 0.15 145)",
  error: "oklch(0.65 0.2 25)",
};

const spring = { type: "spring" as const, stiffness: 300, damping: 20 };

function Orb({
  index,
  state,
  size,
}: {
  index: number;
  state: AIState;
  size: "sm" | "md" | "lg";
}) {
  const s = sizes[size];
  const color = stateColors[state];

  const orbStyle = {
    width: s.orb,
    height: s.orb,
    borderRadius: "50%",
    background: color,
  };

  switch (state) {
    case "idle":
      return <motion.div style={{ ...orbStyle, opacity: 0.3 }} />;

    case "thinking":
      return (
        <motion.div
          style={orbStyle}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut",
          }}
        />
      );

    case "deep-thinking":
      return (
        <motion.div
          style={{
            ...orbStyle,
            boxShadow: `0 0 ${s.orb * 2}px ${color}`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.15,
            ease: "easeInOut",
          }}
        />
      );

    case "tool-calling":
      return (
        <motion.div
          style={orbStyle}
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "linear",
          }}
        />
      );

    case "streaming":
      return (
        <motion.div
          style={orbStyle}
          animate={{
            y: [0, -s.orb, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut",
          }}
        />
      );

    case "complete":
      return (
        <motion.div
          style={{ ...orbStyle, background: stateColors.complete }}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
        />
      );

    case "error":
      return (
        <motion.div
          style={{ ...orbStyle, background: stateColors.error }}
          animate={{ x: [0, -2, 2, -2, 0] }}
          transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 1 }}
        />
      );
  }
}

/**
 * Multi-state AI processing indicator with 7 semantic states.
 * Not bouncing dots — a sophisticated state-machine-driven animation
 * with smooth transitions between states.
 */
export function ThinkingIndicator({
  state,
  labels,
  size = "md",
  className,
}: ThinkingIndicatorProps) {
  const prefersReduced = useReducedMotion();
  const s = sizes[size];

  const label = useMemo(() => {
    const merged = { ...defaultLabels, ...labels };
    return merged[state];
  }, [state, labels]);

  if (state === "idle" && !label) return null;

  // Reduced motion: text label only
  if (prefersReduced) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: s.fontSize,
          color: stateColors[state],
        }}
      >
        {state === "complete" && <span>&#10003;</span>}
        {state === "error" && <span>&#10007;</span>}
        {label && <span>{label}</span>}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* Orbs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: s.gap,
          height: s.container,
          justifyContent: "center",
          minWidth: s.container,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: s.gap,
            }}
          >
            {state === "complete" ? (
              <motion.svg
                width={s.container * 0.6}
                height={s.container * 0.6}
                viewBox="0 0 24 24"
                fill="none"
                stroke={stateColors.complete}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.polyline
                  points="20 6 9 17 4 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </motion.svg>
            ) : (
              [0, 1, 2].map((i) => (
                <Orb key={i} index={i} state={state} size={size} />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        {label && (
          <motion.span
            key={label}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: s.fontSize,
              color: stateColors[state],
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
