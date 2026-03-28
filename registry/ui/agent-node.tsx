"use client";

import type { ReactNode, CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export type AgentStatus = "idle" | "waiting" | "running" | "success" | "error";

export interface AgentNodeProps {
  /** Node label. */
  label: string;
  /** Optional subtitle. */
  subtitle?: string;
  /** Optional icon. */
  icon?: ReactNode;
  /** Current status. */
  status: AgentStatus;
  /** Whether this node is selected. */
  selected?: boolean;
  className?: string;
}

const statusColors: Record<AgentStatus, string> = {
  idle: "oklch(0.5 0 0 / 0.3)",
  waiting: "oklch(0.7 0.1 60)",
  running: "oklch(0.7 0.15 250)",
  success: "oklch(0.7 0.15 145)",
  error: "oklch(0.65 0.2 25)",
};

const statusLabels: Record<AgentStatus, string> = {
  idle: "Idle",
  waiting: "Waiting",
  running: "Running",
  success: "Complete",
  error: "Error",
};

const spring = { type: "spring" as const, stiffness: 300, damping: 20 };

function RippleRing({ color, delay }: { color: string; delay: number }) {
  return (
    <motion.div
      initial={{ scale: 1, opacity: 0.6 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        delay,
        ease: "easeOut",
      }}
      style={{
        position: "absolute",
        inset: -4,
        borderRadius: 12,
        border: `2px solid ${color}`,
        pointerEvents: "none",
      }}
    />
  );
}

/**
 * Styled node for React Flow agent workflow graphs.
 * Features semantic status animations: idle, waiting (pulse),
 * running (ripple), success (checkmark), error (shake).
 *
 * Use as a custom node renderer in React Flow:
 * ```tsx
 * const nodeTypes = { agent: (props) => <AgentNode {...props.data} /> };
 * ```
 */
export function AgentNode({
  label,
  subtitle,
  icon,
  status,
  selected = false,
  className,
}: AgentNodeProps) {
  const prefersReduced = useReducedMotion();
  const borderColor = statusColors[status];

  const containerStyle: CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    borderRadius: 10,
    border: `2px solid ${borderColor}`,
    background: "oklch(0.15 0 0)",
    color: "oklch(0.9 0 0)",
    minWidth: 140,
    cursor: "default",
    ...(selected
      ? { boxShadow: `0 0 0 2px oklch(0.7 0.15 250 / 0.4)` }
      : {}),
  };

  // Reduced motion: static borders + text labels
  if (prefersReduced) {
    return (
      <div
        className={className}
        style={containerStyle}
        role="group"
        aria-label={`${label}: ${statusLabels[status]}`}
      >
        {icon && <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>}
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
          {subtitle && (
            <div style={{ fontSize: 11, color: "oklch(0.6 0 0)" }}>
              {subtitle}
            </div>
          )}
        </div>
        <span
          style={{
            fontSize: 10,
            padding: "1px 6px",
            borderRadius: 4,
            background: `${borderColor}`,
            color: "oklch(0.15 0 0)",
            marginLeft: "auto",
          }}
        >
          {statusLabels[status]}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={containerStyle}
      role="group"
      aria-label={`${label}: ${statusLabels[status]}`}
      animate={
        status === "error"
          ? { x: [0, -3, 3, -3, 0] }
          : { x: 0 }
      }
      transition={
        status === "error"
          ? { duration: 0.4, repeat: Infinity, repeatDelay: 2 }
          : spring
      }
    >
      {/* Ripple rings for running state */}
      {status === "running" && (
        <>
          <RippleRing color={statusColors.running} delay={0} />
          <RippleRing color={statusColors.running} delay={0.5} />
          <RippleRing color={statusColors.running} delay={1} />
        </>
      )}

      {/* Waiting pulse */}
      {status === "waiting" && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: 10,
            border: `2px solid ${statusColors.waiting}`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Icon area */}
      {icon && <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>}

      {/* Labels */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {subtitle && (
          <div style={{ fontSize: 11, color: "oklch(0.6 0 0)" }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Status icon */}
      <AnimatePresence mode="wait">
        {status === "success" && (
          <motion.svg
            key="check"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke={statusColors.success}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={spring}
          >
            <motion.polyline
              points="20 6 9 17 4 12"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" as const }}
            />
          </motion.svg>
        )}
        {status === "error" && (
          <motion.svg
            key="x"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke={statusColors.error}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={spring}
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </motion.svg>
        )}
        {status === "running" && (
          <motion.div
            key="running"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: 14,
              height: 14,
              border: `2px solid ${statusColors.running}`,
              borderTopColor: "transparent",
              borderRadius: "50%",
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
