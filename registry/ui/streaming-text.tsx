"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import { useStreamingBuffer } from "../hooks/use-streaming-buffer";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface StreamingTextProps {
  /** The text content. Can be progressively updated (streaming). */
  content: string;
  /**
   * Animation mode for token reveal.
   * - "luminous" (default): Text materializes with a glowing wavefront
   * - "fade": Soft fade with subtle blur
   * - "blur-in": Deep blur-to-sharp with vertical shift
   * - "slide-up": Spring-based slide with scale
   */
  mode?: "luminous" | "fade" | "blur-in" | "slide-up";
  /** Tokens per second for visual smoothing. Defaults to 40. */
  speed?: number;
  /** Whether content is still streaming. */
  isStreaming?: boolean;
  /** Callback fired when all buffered tokens have been displayed. */
  onComplete?: () => void;
  /** Split by characters instead of words. */
  byCharacter?: boolean;
  className?: string;
}

// --- Premium animation configs ---

const GLOW_TRAIL_LENGTH = 4; // Number of trailing tokens that carry the glow

const modeVariants = {
  luminous: {
    hidden: {
      opacity: 0,
      filter: "blur(8px)",
    },
    settling: {
      opacity: 0.9,
      filter: "blur(0.5px)",
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
    },
  },
  fade: {
    hidden: { opacity: 0, filter: "blur(2px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
  "blur-in": {
    hidden: { opacity: 0, filter: "blur(12px)", y: 6 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
  "slide-up": {
    hidden: { opacity: 0, y: 8, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
} as const;

const modeTransitions = {
  luminous: {
    duration: 0.15,
    ease: [0.16, 1, 0.3, 1] as const, // Apple ease-out
  },
  fade: {
    duration: 0.25,
    ease: [0.16, 1, 0.3, 1] as const,
  },
  "blur-in": {
    duration: 0.35,
    ease: [0.16, 1, 0.3, 1] as const,
  },
  "slide-up": {
    type: "spring" as const,
    stiffness: 350,
    damping: 22,
  },
};

// The luminous glow style for "settling" tokens (last N tokens)
const settlingStyle = {
  color: "oklch(0.93 0.12 250)",
  textShadow:
    "0 0 20px oklch(0.72 0.14 250 / 0.4), 0 0 40px oklch(0.72 0.14 250 / 0.12)",
};

// Settled token style (glow faded)
const settledStyle = {
  color: "inherit",
  textShadow: "none",
  transition: "color 0.6s cubic-bezier(0.76, 0, 0.24, 1), text-shadow 0.6s cubic-bezier(0.76, 0, 0.24, 1)",
};

/**
 * Token-by-token text reveal with premium animation modes.
 *
 * The default "luminous" mode creates a glowing wavefront: the last few
 * tokens carry a blue luminous glow that fades as they settle. Text feels
 * like it materializes from light, not just appears.
 *
 * Decouples network jitter from visual presentation using an internal
 * streaming buffer. Compatible with Vercel AI SDK useChat().
 */
export function StreamingText({
  content,
  mode = "luminous",
  speed = 40,
  isStreaming = true,
  onComplete,
  byCharacter = false,
  className,
}: StreamingTextProps) {
  const prefersReduced = useReducedMotion();
  const prevTokenCountRef = useRef(0);
  const completeFiredRef = useRef(false);

  const { displayedTokens, push, isBuffering, reset } = useStreamingBuffer({
    tokensPerSecond: speed,
    delimiter: byCharacter ? "" : " ",
  });

  useEffect(() => {
    push(content);
  }, [content, push]);

  useEffect(() => {
    if (!isStreaming && !isBuffering && !completeFiredRef.current && displayedTokens.length > 0) {
      completeFiredRef.current = true;
      onComplete?.();
    }
  }, [isStreaming, isBuffering, displayedTokens.length, onComplete]);

  useEffect(() => {
    if (content === "") {
      completeFiredRef.current = false;
      reset();
    }
  }, [content, reset]);

  const isLuminous = mode === "luminous";
  const variants = isLuminous
    ? { hidden: modeVariants.luminous.hidden, visible: modeVariants.luminous.settling }
    : modeVariants[mode];
  const transition = modeTransitions[mode];

  const tokenElements = useMemo(() => {
    const prevCount = prevTokenCountRef.current;
    const total = displayedTokens.length;
    return displayedTokens.map((token, i) => ({
      token,
      index: i,
      isNew: i >= prevCount,
      // For luminous mode: is this token in the glowing trail?
      isSettling: isLuminous && i >= total - GLOW_TRAIL_LENGTH,
    }));
  }, [displayedTokens, isLuminous]);

  useEffect(() => {
    prevTokenCountRef.current = displayedTokens.length;
  }, [displayedTokens.length]);

  if (prefersReduced) {
    return (
      <p className={className} aria-live="polite">
        {displayedTokens.join(byCharacter ? "" : " ")}
        {isStreaming && isBuffering && (
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: 3,
              height: "1.1em",
              marginLeft: 4,
              borderRadius: 2,
              background: "oklch(0.72 0.14 250)",
              opacity: 0.6,
              verticalAlign: "text-bottom",
            }}
          />
        )}
      </p>
    );
  }

  return (
    <p
      className={className}
      aria-live="polite"
      style={{ lineHeight: 1.75, overflowWrap: "break-word" }}
    >
      {tokenElements.map(({ token, index, isNew, isSettling }) => {
        const separator =
          !byCharacter && index < displayedTokens.length - 1 ? "\u00A0" : "";

        if (isNew) {
          return (
            <motion.span
              key={`${index}-${token}`}
              initial="hidden"
              animate="visible"
              variants={variants}
              transition={transition}
              style={{
                display: "inline-block",
                whiteSpace: "pre-wrap",
                ...(isSettling ? settlingStyle : {}),
              }}
            >
              {token}
              {separator}
            </motion.span>
          );
        }

        // Already rendered tokens
        return (
          <span
            key={`${index}-${token}`}
            style={{
              display: "inline-block",
              whiteSpace: "pre-wrap",
              ...(isSettling ? settlingStyle : settledStyle),
            }}
          >
            {token}
            {separator}
          </span>
        );
      })}

      {/* Premium breathing cursor */}
      {isStreaming && (
        <motion.span
          aria-hidden="true"
          animate={{
            opacity: [1, 0.4, 1],
            scaleY: [1, 0.92, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut" as const,
          }}
          style={{
            display: "inline-block",
            width: 3,
            height: "1.1em",
            marginLeft: 4,
            borderRadius: 2,
            background: "oklch(0.72 0.14 250)",
            verticalAlign: "text-bottom",
            boxShadow:
              "0 0 8px oklch(0.72 0.14 250 / 0.6), 0 0 24px oklch(0.72 0.14 250 / 0.25)",
          }}
        />
      )}
    </p>
  );
}
