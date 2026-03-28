"use client";

import { useState, useRef, useCallback, type ReactNode, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const statusColors: Record<AgentStatus, string> = {
  idle: "oklch(0.5 0 0 / 0.3)",
  waiting: "oklch(0.78 0.14 75)",
  running: "oklch(0.72 0.14 250)",
  success: "oklch(0.72 0.16 155)",
  error: "oklch(0.65 0.22 25)",
};

const statusLabels: Record<AgentStatus, string> = {
  idle: "Idle",
  waiting: "Waiting",
  running: "Running",
  success: "Complete",
  error: "Error",
};

/** Status glow configs: background, boxShadow pairs for each active state. */
const statusGlowMap: Partial<
  Record<AgentStatus, { background: string; boxShadow: string }>
> = {
  running: {
    background: "oklch(0.72 0.14 250 / 0.15)",
    boxShadow:
      "0 0 15px oklch(0.72 0.14 250 / 0.2), 0 0 40px oklch(0.72 0.14 250 / 0.1)",
  },
  success: {
    background: "oklch(0.72 0.16 155 / 0.12)",
    boxShadow:
      "0 0 12px oklch(0.72 0.16 155 / 0.15), 0 0 30px oklch(0.72 0.16 155 / 0.08)",
  },
  error: {
    background: "oklch(0.65 0.22 25 / 0.15)",
    boxShadow:
      "0 0 15px oklch(0.65 0.22 25 / 0.2), 0 0 40px oklch(0.65 0.22 25 / 0.1)",
  },
};

// ---------------------------------------------------------------------------
// Motion presets
// ---------------------------------------------------------------------------

const spring = {
  snappy: { type: "spring" as const, stiffness: 300, damping: 24 },
  bouncy: { type: "spring" as const, stiffness: 400, damping: 15 },
};

const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.76, 0, 0.24, 1] as const,
};

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const glassSurface: CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 16px",
  minWidth: 180,
  cursor: "default",
  background:
    "linear-gradient(135deg, oklch(0.18 0.01 260 / 0.8) 0%, oklch(0.14 0.005 260 / 0.7) 100%)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid oklch(0.28 0.01 260 / 0.5)",
  borderRadius: 14,
  boxShadow: [
    "inset 0 1px 0 oklch(1.0 0 0 / 0.06)",
    "inset 0 -1px 0 oklch(0 0 0 / 0.2)",
    "0 2px 4px oklch(0 0 0 / 0.3)",
    "0 4px 12px oklch(0 0 0 / 0.2)",
  ].join(", "),
  color: "oklch(0.93 0.005 260)",
};

const hoverShadow = [
  "inset 0 1px 0 oklch(1.0 0 0 / 0.08)",
  "inset 0 -1px 0 oklch(0 0 0 / 0.2)",
  "0 4px 8px oklch(0 0 0 / 0.3)",
  "0 8px 24px oklch(0 0 0 / 0.2)",
].join(", ");

const selectedShadow = [
  "inset 0 1px 0 oklch(1.0 0 0 / 0.06)",
  "inset 0 -1px 0 oklch(0 0 0 / 0.2)",
  "0 0 0 3px oklch(0.72 0.14 250 / 0.12)",
  "0 4px 12px oklch(0 0 0 / 0.3)",
].join(", ");

const iconWellStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 8,
  flexShrink: 0,
  background: "oklch(0.12 0.005 260 / 0.8)",
  border: "1px solid oklch(0.22 0.01 260 / 0.3)",
  boxShadow:
    "inset 0 1px 3px oklch(0 0 0 / 0.3), 0 1px 0 oklch(1.0 0 0 / 0.03)",
  fontSize: 14,
  fontWeight: 600,
  color: "oklch(0.7 0.05 260)",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Conic-gradient rotating border for running state. */
function RunningBorder() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      style={{
        position: "absolute",
        inset: -2,
        borderRadius: 16,
        background: [
          "conic-gradient(",
          "from 0deg,",
          "oklch(0.72 0.14 250 / 0.0),",
          "oklch(0.72 0.14 250 / 0.5),",
          "oklch(0.78 0.12 200 / 0.3),",
          "oklch(0.72 0.14 250 / 0.0)",
          ")",
        ].join(" "),
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}

/** Edge-bleed glow behind the card, driven by status. */
function StatusGlow({ status }: { status: AgentStatus }) {
  const glow = statusGlowMap[status];

  return (
    <motion.div
      animate={{ opacity: glow ? 1 : 0 }}
      transition={{ duration: 0.3, ease: ease.out }}
      style={{
        position: "absolute",
        inset: -1,
        borderRadius: 15,
        pointerEvents: "none",
        zIndex: -1,
        filter: "blur(6px)",
        background: glow?.background ?? "transparent",
        boxShadow: glow?.boxShadow ?? "none",
      }}
    />
  );
}

/** Diagonal shine sweep that plays on hover. */
function ShineSweep({ isHovered }: { isHovered: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <motion.div
        initial={{ left: "-100%" }}
        animate={{ left: isHovered ? "200%" : "-100%" }}
        transition={
          isHovered
            ? { duration: 0.6, ease: ease.out }
            : { duration: 0 }
        }
        style={{
          position: "absolute",
          top: 0,
          width: "60%",
          height: "100%",
          background:
            "linear-gradient(105deg, transparent 40%, oklch(1.0 0 0 / 0.04) 50%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Styled node for React Flow agent workflow graphs.
 *
 * Premium glassmorphic surface with layered shadows, status glow that bleeds
 * from edges, rotating conic-gradient border in running state, and a diagonal
 * shine sweep on hover.
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
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // -------------------------------------------------------------------------
  // Reduced motion: static surface + text-based status labels
  // -------------------------------------------------------------------------
  if (prefersReduced) {
    const borderColor = statusColors[status];
    return (
      <div
        ref={nodeRef}
        className={className}
        style={{
          ...glassSurface,
          borderColor,
          ...(selected
            ? {
                borderColor: "oklch(0.72 0.14 250 / 0.5)",
                boxShadow: selectedShadow,
              }
            : {}),
        }}
        role="group"
        aria-label={`${label}: ${statusLabels[status]}`}
      >
        {icon && <span style={iconWellStyle}>{icon}</span>}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 550,
              color: "oklch(0.93 0.005 260)",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            {label}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 11,
                color: "oklch(0.45 0.01 260)",
                lineHeight: 1.3,
                marginTop: 1,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        <span
          style={{
            fontSize: 10,
            padding: "2px 6px",
            borderRadius: 4,
            background: borderColor,
            color: "oklch(0.12 0.005 260)",
            fontWeight: 600,
            marginLeft: "auto",
          }}
        >
          {statusLabels[status]}
        </span>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Full animated version
  // -------------------------------------------------------------------------

  const resolvedShadow = selected
    ? selectedShadow
    : isHovered
      ? hoverShadow
      : (glassSurface.boxShadow as string);

  const resolvedBorderColor = selected
    ? "oklch(0.72 0.14 250 / 0.5)"
    : isHovered
      ? "oklch(0.35 0.02 260 / 0.6)"
      : "oklch(0.28 0.01 260 / 0.5)";

  return (
    <motion.div
      ref={nodeRef}
      className={className}
      role="group"
      aria-label={`${label}: ${statusLabels[status]}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        y: isHovered && !selected ? -1 : 0,
        boxShadow: resolvedShadow,
        borderColor: resolvedBorderColor,
        ...(status === "error" ? { x: [0, -3, 3, -3, 0] } : { x: 0 }),
      }}
      transition={
        status === "error"
          ? { x: { duration: 0.4, repeat: Infinity, repeatDelay: 2 }, default: { duration: 0.2, ease: ease.out } }
          : { duration: 0.2, ease: ease.out }
      }
      style={{
        ...glassSurface,
        // Remove boxShadow and borderColor from style so motion controls them
        boxShadow: undefined,
        borderColor: undefined,
      }}
    >
      {/* Status glow (edge bleed) */}
      <StatusGlow status={status} />

      {/* Rotating conic-gradient border for running state */}
      <AnimatePresence>
        {status === "running" && (
          <motion.div
            key="running-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RunningBorder />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting: soft pulsing glow overlay */}
      {status === "waiting" && (
        <motion.div
          animate={{ opacity: [0.0, 0.5, 0.0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: 15,
            border: `1.5px solid ${statusColors.waiting}`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Hover shine sweep */}
      <ShineSweep isHovered={isHovered} />

      {/* Icon well */}
      {icon && <span style={iconWellStyle}>{icon}</span>}

      {/* Labels */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 550,
            color: "oklch(0.93 0.005 260)",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          {label}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 11,
              color: "oklch(0.45 0.01 260)",
              lineHeight: 1.3,
              marginTop: 1,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Status indicator (animated icon) */}
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
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={spring.bouncy}
          >
            <motion.polyline
              points="20 6 9 17 4 12"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: ease.out }}
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
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={spring.snappy}
          >
            <motion.line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25, ease: ease.out }}
            />
            <motion.line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25, delay: 0.05, ease: ease.out }}
            />
          </motion.svg>
        )}

        {status === "running" && (
          <motion.div
            key="spinner"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 360 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              rotate: { duration: 0.8, repeat: Infinity, ease: "linear" },
              scale: spring.snappy,
              opacity: { duration: 0.2 },
            }}
            style={{
              width: 14,
              height: 14,
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: statusColors.running,
              borderTopColor: "transparent",
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
        )}

        {status === "waiting" && (
          <motion.div
            key="waiting-dot"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: statusColors.waiting,
              flexShrink: 0,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
