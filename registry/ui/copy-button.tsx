"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface CopyButtonProps {
  /** The text to copy to clipboard. */
  value: string;
  /** Duration to show success state (ms). Defaults to 2000. */
  successDuration?: number;
  className?: string;
}

const spring = { type: "spring" as const, stiffness: 500, damping: 25 };

/**
 * One-click copy with animated checkmark confirmation.
 * Uses navigator.clipboard with execCommand fallback.
 */
export function CopyButton({
  value,
  successDuration = 2000,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const prefersReduced = useReducedMotion();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), successDuration);
  }, [value, successDuration]);

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      whileTap={prefersReduced ? undefined : { scale: 0.9 }}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 6,
        border: "1px solid oklch(0.5 0 0 / 0.2)",
        background: "transparent",
        cursor: "pointer",
        color: "currentColor",
        transition: "background 150ms",
      }}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.svg
            key="check"
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={prefersReduced ? undefined : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReduced ? undefined : { scale: 0.5, opacity: 0 }}
            transition={spring}
            style={{ color: "oklch(0.7 0.15 145)" }}
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        ) : (
          <motion.svg
            key="copy"
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={prefersReduced ? undefined : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={prefersReduced ? undefined : { scale: 0.5, opacity: 0 }}
            transition={spring}
          >
            <rect x={9} y={9} width={13} height={13} rx={2} ry={2} />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
