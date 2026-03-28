"use client";

import { type ReactNode, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToolCallCardProps {
  /** Tool name. */
  toolName: string;
  /** Tool arguments. */
  args?: Record<string, unknown>;
  /** Tool result (rendered when complete). */
  result?: ReactNode;
  /** Current status. */
  status: "calling" | "running" | "complete" | "error";
  /** Error message. */
  error?: string;
  /** Icon for the tool. */
  icon?: ReactNode;
  className?: string;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const borderColors: Record<ToolCallCardProps["status"], string> = {
  calling: "oklch(0.30 0.05 250 / 0.5)",
  running: "oklch(0.35 0.08 250 / 0.6)",
  complete: "oklch(0.30 0.06 155 / 0.4)",
  error: "oklch(0.30 0.08 25 / 0.5)",
};

const statusIndicatorColors: Record<
  ToolCallCardProps["status"],
  { border: string; bg: string }
> = {
  calling: {
    border: "oklch(0.72 0.14 250)",
    bg: "transparent",
  },
  running: {
    border: "oklch(0.72 0.14 250)",
    bg: "transparent",
  },
  complete: {
    border: "oklch(0.72 0.16 155 / 0.5)",
    bg: "oklch(0.72 0.16 155 / 0.15)",
  },
  error: {
    border: "oklch(0.65 0.22 25 / 0.5)",
    bg: "oklch(0.65 0.22 25 / 0.15)",
  },
};

// ---------------------------------------------------------------------------
// Motion presets
// ---------------------------------------------------------------------------

const spring = {
  snappy: { type: "spring" as const, stiffness: 300, damping: 24 },
  bouncy: { type: "spring" as const, stiffness: 400, damping: 15 },
  expansion: { type: "spring" as const, stiffness: 250, damping: 25 },
};

const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.76, 0, 0.24, 1] as const,
};

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const cardSurface: CSSProperties = {
  position: "relative",
  borderRadius: 12,
  overflow: "hidden",
  fontSize: 13,
  background:
    "linear-gradient(135deg, oklch(0.14 0.008 260 / 0.9) 0%, oklch(0.12 0.005 260 / 0.85) 100%)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid oklch(0.24 0.01 260 / 0.4)",
  boxShadow: [
    "inset 0 1px 0 oklch(1.0 0 0 / 0.04)",
    "0 1px 2px oklch(0 0 0 / 0.2)",
    "0 4px 12px oklch(0 0 0 / 0.15)",
  ].join(", "),
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 14px",
  position: "relative",
  overflow: "hidden",
};

const iconWellStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: 7,
  background: "oklch(0.18 0.01 260 / 0.6)",
  border: "1px solid oklch(0.25 0.01 260 / 0.3)",
  fontSize: 12,
  color: "oklch(0.62 0.01 260)",
  flexShrink: 0,
};

const nameStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 550,
  color: "oklch(0.93 0.005 260)",
  letterSpacing: "-0.01em",
};

const argsStyle: CSSProperties = {
  fontSize: 11,
  fontFamily: "var(--font-mono, ui-monospace, monospace)",
  color: "oklch(0.45 0.01 260)",
  marginTop: 2,
  lineHeight: 1.4,
};

const separatorStyle: CSSProperties = {
  height: 1,
  margin: "0 14px",
  background:
    "linear-gradient(90deg, oklch(0.24 0.01 260 / 0.0), oklch(0.24 0.01 260 / 0.5), oklch(0.24 0.01 260 / 0.0))",
};

const resultStyle: CSSProperties = {
  padding: "10px 14px",
  fontSize: 12,
  lineHeight: 1.6,
};

// ---------------------------------------------------------------------------
// CSS keyframes injected once
// ---------------------------------------------------------------------------

const shimmerKeyframes = `
@keyframes tool-chromatic-shimmer {
  0% { transform: translateX(-150%); }
  100% { transform: translateX(250%); }
}
`;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Five-band chromatic shimmer that simulates light refracting through glass. */
function ChromaticShimmer() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "80%",
          height: "100%",
          background: [
            "linear-gradient(",
            "105deg,",
            "transparent 0%,",
            "oklch(0.72 0.14 250 / 0.02) 25%,",
            "oklch(0.78 0.12 200 / 0.04) 37%,",
            "oklch(1.0 0 0 / 0.06) 50%,",
            "oklch(0.65 0.20 280 / 0.04) 63%,",
            "oklch(0.72 0.14 250 / 0.02) 75%,",
            "transparent 100%",
            ")",
          ].join(" "),
          animation: "tool-chromatic-shimmer 2.5s cubic-bezier(0.45, 0, 0.55, 1) infinite",
          willChange: "transform",
        }}
      />
    </div>
  );
}

/**
 * Morphing status indicator. Rather than swapping distinct SVGs, a single
 * container smoothly transitions shape, color, and inner content.
 */
function StatusIndicator({ status }: { status: ToolCallCardProps["status"] }) {
  const colors = statusIndicatorColors[status];
  const isSpinning = status === "calling" || status === "running";

  return (
    <div
      style={{
        position: "relative",
        width: 14,
        height: 14,
        flexShrink: 0,
      }}
    >
      <AnimatePresence mode="wait">
        {isSpinning && (
          <motion.div
            key="spinner"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{
              rotate: {
                duration: status === "running" ? 0.6 : 0.8,
                repeat: Infinity,
                ease: "linear",
              },
              opacity: { duration: 0.2, ease: ease.out },
              scale: spring.snappy,
            }}
            style={{
              position: "absolute",
              inset: 0,
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: colors.border,
              borderTopColor: "transparent",
              borderRadius: "50%",
            }}
          />
        )}

        {status === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: 1,
              scale: [0.8, 1.1, 1],
            }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={spring.bouncy}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: colors.bg,
              border: `1.5px solid ${colors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.svg
              width={9}
              height={9}
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
                transition={{ duration: 0.3, delay: 0.1, ease: ease.out }}
              />
            </motion.svg>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={spring.snappy}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: colors.bg,
              border: `1.5px solid ${colors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.svg
              width={8}
              height={8}
              viewBox="0 0 24 24"
              fill="none"
              stroke="oklch(0.65 0.22 25)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Shows a tool invocation with glassmorphic surface, chromatic shimmer during
 * calling/running, two-phase expansion to reveal results, and morphing status
 * indicators.
 *
 * Status-aware:
 * - calling/running: 5-band chromatic shimmer + rotating spinner
 * - complete: spring expansion -> gradient separator -> content fade+slide
 * - error: shake + red glow + error content
 */
export function ToolCallCard({
  toolName,
  args,
  result,
  status,
  error,
  icon,
  className,
}: ToolCallCardProps) {
  const prefersReduced = useReducedMotion();
  const isExpanded = status === "complete" || status === "error";
  const showShimmer =
    (status === "calling" || status === "running") && !prefersReduced;

  // -------------------------------------------------------------------------
  // Reduced motion: static version
  // -------------------------------------------------------------------------
  if (prefersReduced) {
    return (
      <div
        className={className}
        style={{
          ...cardSurface,
          borderColor: borderColors[status],
        }}
      >
        {/* Header */}
        <div style={headerStyle}>
          {icon && <span style={iconWellStyle}>{icon}</span>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={nameStyle}>{toolName}</div>
            {args && Object.keys(args).length > 0 && (
              <div style={argsStyle}>
                {Object.entries(args)
                  .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                  .join(", ")}
              </div>
            )}
          </div>
          <StatusIndicatorStatic status={status} />
        </div>

        {/* Expanded result */}
        {isExpanded && (result ?? error) && (
          <>
            <div style={separatorStyle} />
            <div
              style={{
                ...resultStyle,
                color:
                  status === "error"
                    ? "oklch(0.65 0.22 25)"
                    : "oklch(0.93 0.005 260)",
              }}
            >
              {status === "error" ? error : result}
            </div>
          </>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Full animated version
  // -------------------------------------------------------------------------
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <motion.div
        className={className}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          borderColor: borderColors[status],
          x: status === "error" ? [0, -2, 2, -2, 0] : 0,
        }}
        transition={
          status === "error"
            ? {
                x: { duration: 0.3, repeat: 2 },
                borderColor: { duration: 0.4, ease: ease.inOut },
                default: spring.snappy,
              }
            : {
                borderColor: { duration: 0.4, ease: ease.inOut },
                default: spring.snappy,
              }
        }
        layout
        style={{
          ...cardSurface,
          borderColor: undefined, // motion controls this
        }}
      >
        {/* Chromatic shimmer overlay */}
        {showShimmer && <ChromaticShimmer />}

        {/* Header */}
        <div style={headerStyle}>
          {icon && <span style={iconWellStyle}>{icon}</span>}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={nameStyle}>{toolName}</div>
            {args && Object.keys(args).length > 0 && (
              <div style={argsStyle}>
                {Object.entries(args)
                  .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                  .join(", ")}
              </div>
            )}
          </div>

          {/* Morphing status indicator */}
          <StatusIndicator status={status} />
        </div>

        {/* Two-phase expansion: height first, then content fade+slide */}
        <AnimatePresence initial={false}>
          {isExpanded && (result ?? error) && (
            <motion.div
              key="expansion"
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={spring.expansion}
              style={{ overflow: "hidden" }}
            >
              {/* Gradient separator */}
              <div style={separatorStyle} />

              {/* Phase 2: content fades in with slide, delayed */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{
                  duration: 0.25,
                  delay: 0.12,
                  ease: ease.out,
                }}
                style={{
                  ...resultStyle,
                  color:
                    status === "error"
                      ? "oklch(0.65 0.22 25)"
                      : "oklch(0.93 0.005 260)",
                }}
              >
                {status === "error" ? error : result}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Static status indicator for reduced-motion path
// ---------------------------------------------------------------------------

function StatusIndicatorStatic({
  status,
}: {
  status: ToolCallCardProps["status"];
}) {
  const colors = statusIndicatorColors[status];

  if (status === "calling" || status === "running") {
    return (
      <div
        style={{
          width: 14,
          height: 14,
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: colors.border,
          borderTopColor: "transparent",
          borderRadius: "50%",
          flexShrink: 0,
        }}
      />
    );
  }

  if (status === "complete") {
    return (
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: colors.bg,
          border: `1.5px solid ${colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          width={9}
          height={9}
          viewBox="0 0 24 24"
          fill="none"
          stroke="oklch(0.72 0.16 155)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={8}
        height={8}
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
  );
}
