"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { AIState } from "../hooks/use-ai-state";
import { useReducedMotion } from "../hooks/use-reduced-motion";

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
  sm: { diameter: 24, fontSize: 11, gap: 8 },
  md: { diameter: 36, fontSize: 13, gap: 10 },
  lg: { diameter: 48, fontSize: 15, gap: 12 },
};

const stateGlowColors: Record<AIState, string> = {
  idle: "oklch(0.5 0 0 / 0.1)",
  thinking: "oklch(0.72 0.14 250 / 0.3)",
  "deep-thinking": "oklch(0.65 0.20 280 / 0.4)",
  "tool-calling": "oklch(0.78 0.12 200 / 0.3)",
  streaming: "oklch(0.72 0.14 250 / 0.2)",
  complete: "oklch(0.72 0.16 155 / 0.3)",
  error: "oklch(0.65 0.22 25 / 0.3)",
};

/**
 * The orb — a single multi-layered glassmorphic element that morphs between states.
 * Not three bouncing dots. A living, breathing indicator.
 */
function Orb({ state, diameter }: { state: AIState; diameter: number }) {
  const isActive = state !== "idle" && state !== "complete" && state !== "error";

  // Core rotation speed varies by state
  const coreSpeed = state === "deep-thinking" ? 4 : state === "tool-calling" ? 0 : 8;
  const fluidSpeed = state === "deep-thinking" ? 6 : 12;

  return (
    <motion.div
      animate={
        state === "deep-thinking"
          ? { scale: [1, 1.08, 1] }
          : state === "streaming"
            ? { scaleX: [1, 1.12, 1], scaleY: [1, 0.92, 1] }
            : { scale: 1 }
      }
      transition={
        state === "deep-thinking"
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
          : state === "streaming"
            ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }
            : { type: "spring" as const, stiffness: 300, damping: 20 }
      }
      style={{
        position: "relative",
        width: diameter,
        height: diameter,
        borderRadius: 9999,
        // Glassmorphic shell
        background: "linear-gradient(135deg, oklch(0.18 0.01 260 / 0.7), oklch(0.12 0.005 260 / 0.5))",
        backdropFilter: "blur(12px)",
        border: "1px solid oklch(0.30 0.02 260 / 0.3)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Inner core — radial gradient, rotates */}
      {isActive && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={coreSpeed > 0 ? { duration: coreSpeed, repeat: Infinity, ease: "linear" } : undefined}
          style={{
            position: "absolute",
            inset: "20%",
            borderRadius: 9999,
            background:
              "radial-gradient(circle at 40% 35%, oklch(0.72 0.14 250 / 0.9), oklch(0.65 0.20 280 / 0.6) 50%, oklch(0.50 0.10 250 / 0.0) 100%)",
            filter: "blur(3px)",
          }}
        />
      )}

      {/* Fluid layer — counter-rotating conic gradient */}
      {isActive && (
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: fluidSpeed, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: "15%",
            borderRadius: 9999,
            background:
              "conic-gradient(from 0deg, oklch(0.78 0.12 200 / 0.0), oklch(0.72 0.14 250 / 0.5), oklch(0.65 0.20 280 / 0.5), oklch(0.78 0.12 200 / 0.0))",
            filter: "blur(4px)",
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Tool-calling scan ring */}
      {state === "tool-calling" && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: 9999,
            background:
              "conic-gradient(from 0deg, transparent 0%, oklch(0.78 0.12 200 / 0.6) 30%, transparent 60%)",
          }}
        />
      )}

      {/* Specular highlight — glassy catch light */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "15%",
          width: "40%",
          height: "25%",
          borderRadius: 9999,
          background:
            "linear-gradient(180deg, oklch(1.0 0 0 / 0.2) 0%, oklch(1.0 0 0 / 0.0) 100%)",
          filter: "blur(2px)",
          pointerEvents: "none",
        }}
      />

      {/* Complete state: checkmark */}
      {state === "complete" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "oklch(0.72 0.16 155 / 0.15)",
          }}
        >
          <motion.svg
            width={diameter * 0.45}
            height={diameter * 0.45}
            viewBox="0 0 24 24"
            fill="none"
            stroke="oklch(0.72 0.16 155)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.polyline
              points="20 6 9 17 4 12"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" as const }}
            />
          </motion.svg>
        </div>
      )}

      {/* Error state: X mark + red tint */}
      {state === "error" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "oklch(0.65 0.22 25 / 0.15)",
          }}
        >
          <svg
            width={diameter * 0.4}
            height={diameter * 0.4}
            viewBox="0 0 24 24"
            fill="none"
            stroke="oklch(0.65 0.22 25)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
      )}

      {/* Idle state: dim static orb */}
      {state === "idle" && (
        <div
          style={{
            position: "absolute",
            inset: "30%",
            borderRadius: 9999,
            background: "oklch(0.4 0.02 260 / 0.3)",
            filter: "blur(2px)",
          }}
        />
      )}
    </motion.div>
  );
}

/**
 * Multi-layered glassmorphic AI processing indicator.
 *
 * A single orb with rotating inner layers, specular highlights,
 * and state-specific morphing. Thinking rotates slowly, deep-thinking
 * breathes, tool-calling shows a scanning sweep, streaming elongates
 * into a pill, complete draws a checkmark, error shakes red.
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

  if (prefersReduced) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: s.gap,
          fontSize: s.fontSize,
          color: "oklch(0.7 0.1 250)",
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
        gap: s.gap,
      }}
    >
      {/* Outer glow */}
      <div style={{ position: "relative" }}>
        <motion.div
          animate={{
            opacity:
              state === "idle" ? 0 :
              state === "complete" ? [0.2, 0] :
              state === "deep-thinking" ? [0.2, 0.45, 0.2] :
              [0.15, 0.3, 0.15],
            scale:
              state === "deep-thinking" ? [1, 1.3, 1] :
              [1, 1.1, 1],
          }}
          transition={{
            duration: state === "deep-thinking" ? 2 : 3,
            repeat: state === "complete" ? 0 : Infinity,
            ease: "easeInOut" as const,
          }}
          style={{
            position: "absolute",
            inset: -(s.diameter * 0.4),
            borderRadius: 9999,
            background: stateGlowColors[state],
            filter: `blur(${s.diameter * 0.5}px)`,
            pointerEvents: "none",
          }}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <Orb state={state} diameter={s.diameter} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        {label && (
          <motion.span
            key={label}
            initial={{ opacity: 0, x: -4, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 4, filter: "blur(4px)" }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
            style={{
              fontSize: s.fontSize,
              color: "oklch(0.6 0.01 260)",
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
