"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface ReasoningTraceProps {
  /** The reasoning/thinking text content. */
  content: string;
  /** Whether reasoning is still being generated. */
  isStreaming?: boolean;
  /** Duration in seconds (shown in collapsed summary). */
  durationSeconds?: number;
  /** Whether initially open. Defaults to true when streaming. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const spring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

/**
 * Collapsible chain-of-thought with spring animations.
 * Auto-opens during streaming, auto-collapses when complete.
 * Shows "Thought for X seconds" summary when collapsed.
 */
export function ReasoningTrace({
  content,
  isStreaming = false,
  durationSeconds,
  defaultOpen,
  open: controlledOpen,
  onOpenChange,
  className,
}: ReasoningTraceProps) {
  const prefersReduced = useReducedMotion();
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(
    defaultOpen ?? isStreaming,
  );
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const prevStreamingRef = useRef(isStreaming);
  const contentRef = useRef<HTMLDivElement>(null);

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange],
  );

  // Auto-open when streaming starts
  useEffect(() => {
    if (isStreaming && !prevStreamingRef.current) {
      setOpen(true);
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming, setOpen]);

  // Auto-close 1s after streaming ends
  useEffect(() => {
    if (!isStreaming && prevStreamingRef.current) {
      const timer = setTimeout(() => setOpen(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, setOpen]);

  const summaryText = isStreaming
    ? "Thinking..."
    : durationSeconds
      ? `Thought for ${durationSeconds}s`
      : "Thought process";

  if (!content) return null;

  return (
    <div
      className={className}
      style={{
        borderRadius: 8,
        border: "1px solid oklch(0.5 0 0 / 0.15)",
        overflow: "hidden",
        fontSize: 14,
      }}
    >
      {/* Summary / Toggle */}
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "8px 12px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "oklch(0.6 0 0)",
          fontSize: 13,
          textAlign: "left",
        }}
      >
        {/* Chevron */}
        <motion.svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={prefersReduced ? { duration: 0 } : spring}
        >
          <polyline points="9 18 15 12 9 6" />
        </motion.svg>

        {/* Streaming dot */}
        {isStreaming && (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "oklch(0.7 0.15 250)",
              flexShrink: 0,
            }}
          />
        )}

        <AnimatePresence mode="wait">
          <motion.span
            key={summaryText}
            initial={prefersReduced ? undefined : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
          >
            {summaryText}
          </motion.span>
        </AnimatePresence>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={prefersReduced ? undefined : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={prefersReduced ? undefined : { height: 0, opacity: 0 }}
            transition={prefersReduced ? { duration: 0 } : spring}
            style={{ overflow: "hidden" }}
          >
            <div
              ref={contentRef}
              style={{
                padding: "0 12px 12px",
                color: "oklch(0.6 0 0 / 0.8)",
                fontSize: 13,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                borderTop: "1px solid oklch(0.5 0 0 / 0.1)",
                paddingTop: 12,
              }}
            >
              {content}
              {isStreaming && (
                <motion.span
                  aria-hidden="true"
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: "1em",
                    marginLeft: 2,
                    background: "currentColor",
                    verticalAlign: "text-bottom",
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
