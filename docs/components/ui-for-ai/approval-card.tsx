"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface ApprovalCardProps {
  /** What the agent wants to do. */
  title: string;
  /** Detailed description of the proposed action. */
  description?: string;
  /** Impact level shown as a badge. */
  impact?: "low" | "medium" | "high" | "critical";
  /** Optional cost or resource estimate. */
  cost?: string;
  /** Custom content (e.g., a diff view, affected items). */
  children?: ReactNode;
  /** Called when user approves. */
  onApprove: () => void;
  /** Called when user rejects. */
  onReject: () => void;
  /** Whether the action is being executed after approval. */
  isExecuting?: boolean;
  /** Whether this card has been resolved (approved or rejected). */
  resolved?: "approved" | "rejected";
  className?: string;
}

const impactConfig: Record<NonNullable<ApprovalCardProps["impact"]>, { color: string; bg: string; label: string }> = {
  low: { color: "oklch(0.72 0.16 155)", bg: "oklch(0.72 0.16 155 / 0.1)", label: "Low impact" },
  medium: { color: "oklch(0.78 0.14 75)", bg: "oklch(0.78 0.14 75 / 0.1)", label: "Medium impact" },
  high: { color: "oklch(0.72 0.18 40)", bg: "oklch(0.72 0.18 40 / 0.1)", label: "High impact" },
  critical: { color: "oklch(0.65 0.22 25)", bg: "oklch(0.65 0.22 25 / 0.1)", label: "Critical" },
};

const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

/**
 * Human-in-the-loop approval card.
 *
 * Agent proposes an action, user approves or rejects. Shows impact level,
 * cost estimate, and optional custom content (diff view, list of changes).
 * Resolves with a subtle animation indicating the outcome.
 */
export function ApprovalCard({
  title,
  description,
  impact,
  cost,
  children,
  onApprove,
  onReject,
  isExecuting = false,
  resolved,
  className,
}: ApprovalCardProps) {
  const prefersReduced = useReducedMotion();
  const impactInfo = impact ? impactConfig[impact] : null;

  const borderColor = resolved === "approved"
    ? "oklch(0.72 0.16 155 / 0.3)"
    : resolved === "rejected"
      ? "oklch(0.65 0.22 25 / 0.2)"
      : "oklch(0.78 0.14 75 / 0.3)";

  return (
    <motion.div
      className={className}
      initial={prefersReduced ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        background: "linear-gradient(135deg, oklch(0.14 0.01 260 / 0.9), oklch(0.10 0.005 260 / 0.85))",
        backdropFilter: "blur(12px)",
        border: `1px solid ${borderColor}`,
        boxShadow: [
          "inset 0 1px 0 oklch(1.0 0 0 / 0.04)",
          "0 2px 8px oklch(0 0 0 / 0.2)",
          "0 8px 24px oklch(0 0 0 / 0.15)",
        ].join(", "),
        transition: "border-color 300ms",
      }}
    >
      {/* Warning stripe at top */}
      <div
        style={{
          height: 3,
          background: resolved === "approved"
            ? "oklch(0.72 0.16 155)"
            : resolved === "rejected"
              ? "oklch(0.65 0.22 25 / 0.5)"
              : "linear-gradient(90deg, oklch(0.78 0.14 75), oklch(0.72 0.18 40))",
          transition: "background 300ms",
        }}
      />

      {/* Header */}
      <div style={{ padding: "14px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Shield icon */}
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="oklch(0.78 0.14 75)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 600, color: "oklch(0.9 0.005 260)", letterSpacing: "-0.01em" }}>
                {title}
              </span>
            </div>
            {description && (
              <p style={{ fontSize: 12, color: "oklch(0.50 0.01 260)", marginTop: 6, lineHeight: 1.5 }}>
                {description}
              </p>
            )}
          </div>

          {/* Badges */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {impactInfo && (
              <span style={{ fontSize: 10, fontFamily: "var(--font-geist-mono, monospace)", padding: "2px 8px", borderRadius: 4, background: impactInfo.bg, color: impactInfo.color }}>
                {impactInfo.label}
              </span>
            )}
            {cost && (
              <span style={{ fontSize: 10, fontFamily: "var(--font-geist-mono, monospace)", padding: "2px 8px", borderRadius: 4, background: "oklch(0.20 0.01 260 / 0.5)", color: "oklch(0.60 0.01 260)" }}>
                {cost}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Custom content */}
      {children && (
        <div style={{ padding: "0 16px 12px" }}>
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: "oklch(0.08 0.005 260 / 0.6)",
              border: "1px solid oklch(0.18 0.005 260 / 0.3)",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            {children}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <AnimatePresence mode="wait">
        {!resolved ? (
          <motion.div
            key="actions"
            initial={prefersReduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: "12px 16px 14px",
              borderTop: "1px solid oklch(0.20 0.01 260 / 0.3)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={onReject}
              disabled={isExecuting}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                border: "1px solid oklch(0.25 0.01 260 / 0.4)",
                background: "oklch(0.12 0.005 260 / 0.6)",
                color: "oklch(0.65 0.01 260)",
                cursor: isExecuting ? "not-allowed" : "pointer",
              }}
            >
              Reject
            </button>
            <motion.button
              type="button"
              onClick={onApprove}
              disabled={isExecuting}
              whileTap={prefersReduced ? undefined : { scale: 0.96 }}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                border: "none",
                background: "oklch(0.72 0.16 155)",
                color: "oklch(0.08 0.005 260)",
                cursor: isExecuting ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {isExecuting && (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                  style={{ display: "inline-flex", width: 12, height: 12 }}
                >
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                  </svg>
                </motion.span>
              )}
              {isExecuting ? "Executing..." : "Approve"}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="resolved"
            initial={prefersReduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: "10px 16px",
              borderTop: "1px solid oklch(0.20 0.01 260 / 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontSize: 12,
              color: resolved === "approved" ? "oklch(0.72 0.16 155)" : "oklch(0.55 0.05 25)",
            }}
          >
            {resolved === "approved" ? (
              <>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Approved
              </>
            ) : (
              <>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1={18} y1={6} x2={6} y2={18} />
                  <line x1={6} y1={6} x2={18} y2={18} />
                </svg>
                Rejected
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
