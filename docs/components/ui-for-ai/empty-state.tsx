"use client";

import type { ReactNode, CSSProperties } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface EmptyStateProps {
  /** The variant determines the default icon and color. */
  variant?: "no-data" | "no-results" | "error" | "first-run" | "offline";
  /** Custom icon (overrides variant default). */
  icon?: ReactNode;
  /** Title text. */
  title: string;
  /** Description text. */
  description?: string;
  /** Primary action button. */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Secondary action. */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantConfig: Record<
  NonNullable<EmptyStateProps["variant"]>,
  { color: string; icon: ReactNode }
> = {
  "no-data": {
    color: "oklch(0.72 0.14 250)",
    icon: (
      <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
        <line x1={3} y1={9} x2={21} y2={9} />
        <line x1={9} y1={21} x2={9} y2={9} />
      </svg>
    ),
  },
  "no-results": {
    color: "oklch(0.78 0.14 75)",
    icon: (
      <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx={11} cy={11} r={8} />
        <line x1={21} y1={21} x2={16.65} y2={16.65} />
        <line x1={8} y1={11} x2={14} y2={11} />
      </svg>
    ),
  },
  error: {
    color: "oklch(0.65 0.22 25)",
    icon: (
      <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx={12} cy={12} r={10} />
        <line x1={12} y1={8} x2={12} y2={12} />
        <line x1={12} y1={16} x2={12.01} y2={16} />
      </svg>
    ),
  },
  "first-run": {
    color: "oklch(0.72 0.16 155)",
    icon: (
      <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  offline: {
    color: "oklch(0.55 0.08 260)",
    icon: (
      <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1={1} y1={1} x2={23} y2={23} />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1={12} y1={20} x2={12.01} y2={20} />
      </svg>
    ),
  },
};

const buttonBase: CSSProperties = {
  padding: "8px 20px",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  border: "none",
  transition: "opacity 150ms",
};

/**
 * Empty state component for no-data, no-results, error, first-run, and offline states.
 * The #2 complaint about vibe-coded apps is missing edge states — this fixes that.
 *
 * Glassmorphic surface with subtle entrance animation and variant-specific icons/colors.
 */
export function EmptyState({
  variant = "no-data",
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const prefersReduced = useReducedMotion();
  const config = variantConfig[variant];
  const resolvedIcon = icon ?? config.icon;

  const content = (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "48px 24px",
      }}
    >
      {/* Icon with glow */}
      <div
        style={{
          position: "relative",
          marginBottom: 20,
          color: config.color,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -16,
            borderRadius: 9999,
            background: `radial-gradient(circle, ${config.color.replace(")", " / 0.1)")}, transparent 70%)`,
            filter: "blur(12px)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative" }}>{resolvedIcon}</div>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "oklch(0.88 0.005 260)",
          marginBottom: 6,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize: 13,
            color: "oklch(0.48 0.01 260)",
            maxWidth: 320,
            lineHeight: 1.6,
            marginBottom: action ? 20 : 0,
          }}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div style={{ display: "flex", gap: 10 }}>
          {action && (
            <button
              onClick={action.onClick}
              type="button"
              style={{
                ...buttonBase,
                background: config.color,
                color: "oklch(0.08 0.005 260)",
              }}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              type="button"
              style={{
                ...buttonBase,
                background: "oklch(0.14 0.008 260 / 0.8)",
                color: "oklch(0.65 0.01 260)",
                border: "1px solid oklch(0.22 0.01 260 / 0.4)",
              }}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (prefersReduced) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {content}
    </motion.div>
  );
}
