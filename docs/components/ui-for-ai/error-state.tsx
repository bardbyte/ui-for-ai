"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface ErrorStateProps {
  /** Error variant determines the icon and default messaging. */
  variant?: "network" | "auth" | "rate-limit" | "server" | "not-found" | "unknown";
  /** Error title override. */
  title?: string;
  /** Error message/description. */
  message?: string;
  /** Technical details (stack trace, error code, etc.). Shown in collapsible. */
  details?: string;
  /** Retry action. */
  onRetry?: () => void;
  /** Whether retry is in progress. */
  isRetrying?: boolean;
  /** Custom icon. */
  icon?: ReactNode;
  className?: string;
}

const variantDefaults: Record<
  NonNullable<ErrorStateProps["variant"]>,
  { title: string; message: string; code: string }
> = {
  network: {
    title: "Connection failed",
    message: "Check your internet connection and try again.",
    code: "NETWORK_ERROR",
  },
  auth: {
    title: "Authentication required",
    message: "Your session has expired. Please sign in again.",
    code: "AUTH_ERROR",
  },
  "rate-limit": {
    title: "Too many requests",
    message: "You've hit the rate limit. Wait a moment and try again.",
    code: "RATE_LIMIT",
  },
  server: {
    title: "Something went wrong",
    message: "Our servers are having trouble. We're working on it.",
    code: "SERVER_ERROR",
  },
  "not-found": {
    title: "Not found",
    message: "The resource you're looking for doesn't exist or was moved.",
    code: "NOT_FOUND",
  },
  unknown: {
    title: "Unexpected error",
    message: "Something unexpected happened. Please try again.",
    code: "UNKNOWN",
  },
};

const spring = { type: "spring" as const, stiffness: 300, damping: 24 };

/**
 * Graceful error display with variant-specific messaging, retry button,
 * and collapsible technical details.
 *
 * Prevents the "white screen of death" — gives users clear next steps.
 */
export function ErrorState({
  variant = "unknown",
  title,
  message,
  details,
  onRetry,
  isRetrying = false,
  icon,
  className,
}: ErrorStateProps) {
  const prefersReduced = useReducedMotion();
  const [showDetails, setShowDetails] = useState(false);
  const defaults = variantDefaults[variant];
  const resolvedTitle = title ?? defaults.title;
  const resolvedMessage = message ?? defaults.message;

  const errorIcon = icon ?? (
    <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="oklch(0.65 0.22 25)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1={12} y1={9} x2={12} y2={13} />
      <line x1={12} y1={17} x2={12.01} y2={17} />
    </svg>
  );

  const content = (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "40px 24px",
        borderRadius: 16,
        background: "linear-gradient(135deg, oklch(0.14 0.01 20 / 0.4), oklch(0.10 0.005 260 / 0.6))",
        border: "1px solid oklch(0.65 0.22 25 / 0.15)",
        boxShadow: "inset 0 1px 0 oklch(1.0 0 0 / 0.03), 0 4px 16px oklch(0 0 0 / 0.2)",
      }}
    >
      {/* Icon with red glow */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <div
          style={{
            position: "absolute",
            inset: -20,
            borderRadius: 9999,
            background: "radial-gradient(circle, oklch(0.65 0.22 25 / 0.12), transparent 70%)",
            filter: "blur(16px)",
          }}
        />
        <div style={{ position: "relative" }}>{errorIcon}</div>
      </div>

      {/* Code badge */}
      <span
        style={{
          fontSize: 10,
          fontFamily: "var(--font-geist-mono, monospace)",
          color: "oklch(0.55 0.08 25)",
          background: "oklch(0.65 0.22 25 / 0.08)",
          padding: "2px 8px",
          borderRadius: 4,
          marginBottom: 12,
          letterSpacing: "0.05em",
        }}
      >
        {defaults.code}
      </span>

      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "oklch(0.88 0.005 260)",
          marginBottom: 6,
          letterSpacing: "-0.01em",
        }}
      >
        {resolvedTitle}
      </h3>

      <p
        style={{
          fontSize: 13,
          color: "oklch(0.48 0.01 260)",
          maxWidth: 320,
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        {resolvedMessage}
      </p>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {onRetry && (
          <motion.button
            onClick={onRetry}
            disabled={isRetrying}
            whileTap={prefersReduced ? undefined : { scale: 0.95 }}
            type="button"
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              border: "none",
              background: "oklch(0.93 0.005 260)",
              color: "oklch(0.08 0.005 260)",
              cursor: isRetrying ? "wait" : "pointer",
              opacity: isRetrying ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {isRetrying && (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                style={{ display: "inline-flex", width: 14, height: 14 }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                </svg>
              </motion.span>
            )}
            {isRetrying ? "Retrying..." : "Try again"}
          </motion.button>
        )}
      </div>

      {/* Collapsible details */}
      {details && (
        <div style={{ marginTop: 16, width: "100%", maxWidth: 400 }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            type="button"
            style={{
              fontSize: 11,
              color: "oklch(0.42 0.01 260)",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            {showDetails ? "Hide details" : "Show details"}
          </button>
          <AnimatePresence initial={false}>
            {showDetails && (
              <motion.div
                initial={prefersReduced ? undefined : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={prefersReduced ? undefined : { height: 0, opacity: 0 }}
                transition={spring}
                style={{ overflow: "hidden" }}
              >
                <pre
                  style={{
                    marginTop: 8,
                    padding: 12,
                    borderRadius: 8,
                    background: "oklch(0.08 0.005 260)",
                    border: "1px solid oklch(0.18 0.005 260 / 0.5)",
                    fontSize: 11,
                    lineHeight: 1.5,
                    color: "oklch(0.55 0.01 260)",
                    fontFamily: "var(--font-geist-mono, monospace)",
                    overflowX: "auto",
                    textAlign: "left",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {details}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  if (prefersReduced) return content;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {content}
    </motion.div>
  );
}
