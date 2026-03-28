"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

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

const statusColors = {
  calling: "oklch(0.6 0.1 250 / 0.3)",
  running: "oklch(0.6 0.1 250 / 0.5)",
  complete: "oklch(0.6 0.1 145 / 0.3)",
  error: "oklch(0.6 0.15 25 / 0.3)",
};

const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

/**
 * Shows a tool invocation with animated expansion to reveal results.
 * Status-aware: shimmer during calling/running, expand for result, shake on error.
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

  return (
    <motion.div
      className={className}
      initial={prefersReduced ? undefined : { scale: 0.95, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: status === "error" && !prefersReduced ? [0, -2, 2, -2, 0] : 0,
      }}
      transition={
        status === "error"
          ? { x: { duration: 0.3, repeat: 2 } }
          : spring
      }
      layout={!prefersReduced}
      style={{
        borderRadius: 8,
        border: `1px solid ${statusColors[status]}`,
        overflow: "hidden",
        fontSize: 13,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Shimmer overlay for calling/running */}
        {(status === "calling" || status === "running") && !prefersReduced && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent, oklch(0.5 0 0 / 0.05), transparent)",
              animation: "tool-card-shimmer 2s linear infinite",
            }}
          />
        )}

        {icon && (
          <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500 }}>{toolName}</div>
          {args && Object.keys(args).length > 0 && (
            <div
              style={{
                fontSize: 11,
                color: "oklch(0.5 0 0)",
                marginTop: 2,
                fontFamily: "monospace",
              }}
            >
              {Object.entries(args)
                .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                .join(", ")}
            </div>
          )}
        </div>

        {/* Status indicator */}
        {(status === "calling" || status === "running") && (
          <motion.div
            animate={prefersReduced ? undefined : { rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: 14,
              height: 14,
              border: "2px solid oklch(0.6 0.1 250)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
        )}
        {status === "complete" && (
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="oklch(0.7 0.15 145)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {status === "error" && (
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="oklch(0.65 0.2 25)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>

      {/* Expandable result */}
      <AnimatePresence initial={false}>
        {isExpanded && (result || error) && (
          <motion.div
            initial={prefersReduced ? undefined : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={prefersReduced ? undefined : { height: 0, opacity: 0 }}
            transition={prefersReduced ? { duration: 0 } : spring}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "8px 12px",
                borderTop: "1px solid oklch(0.5 0 0 / 0.1)",
                fontSize: 12,
                lineHeight: 1.6,
                color: status === "error" ? "oklch(0.65 0.2 25)" : undefined,
              }}
            >
              {status === "error" ? error : result}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes tool-card-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  );
}
