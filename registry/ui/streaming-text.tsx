"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion } from "motion/react";
import { useStreamingBuffer } from "../hooks/use-streaming-buffer";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface StreamingTextProps {
  /** The text content. Can be progressively updated (streaming). */
  content: string;
  /** Animation mode for token reveal. Defaults to "fade". */
  mode?: "fade" | "blur-in" | "slide-up" | "typewriter";
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

const modeVariants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "blur-in": {
    hidden: { opacity: 0, filter: "blur(4px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
  "slide-up": {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0 },
  },
  typewriter: {
    hidden: { opacity: 0, width: 0 },
    visible: { opacity: 1, width: "auto" },
  },
} as const;

const modeTransitions = {
  fade: { duration: 0.3, ease: "easeOut" as const },
  "blur-in": { duration: 0.4, ease: "easeOut" as const },
  "slide-up": {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
  },
  typewriter: { duration: 0.15, ease: "easeOut" as const },
};

/**
 * Token-by-token text reveal with multiple animation modes.
 *
 * Decouples network jitter from visual presentation using an internal
 * streaming buffer. Tokens arriving in bursts are visually staggered;
 * network pauses produce natural visual pauses.
 *
 * Compatible with Vercel AI SDK — pass content from useChat().
 */
export function StreamingText({
  content,
  mode = "fade",
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

  // Push new content into the buffer as it streams in
  useEffect(() => {
    push(content);
  }, [content, push]);

  // Fire onComplete when streaming ends and buffer is drained
  useEffect(() => {
    if (!isStreaming && !isBuffering && !completeFiredRef.current && displayedTokens.length > 0) {
      completeFiredRef.current = true;
      onComplete?.();
    }
  }, [isStreaming, isBuffering, displayedTokens.length, onComplete]);

  // Reset complete flag when content is cleared
  useEffect(() => {
    if (content === "") {
      completeFiredRef.current = false;
      reset();
    }
  }, [content, reset]);

  const variants = modeVariants[mode];
  const transition = modeTransitions[mode];

  // Determine which tokens are new (need animation) vs already displayed
  const tokenElements = useMemo(() => {
    const prevCount = prevTokenCountRef.current;
    return displayedTokens.map((token, i) => ({
      token,
      index: i,
      isNew: i >= prevCount,
    }));
  }, [displayedTokens]);

  // Update prevTokenCount after render
  useEffect(() => {
    prevTokenCountRef.current = displayedTokens.length;
  }, [displayedTokens.length]);

  // If user prefers reduced motion, show all tokens instantly
  if (prefersReduced) {
    return (
      <p className={className} aria-live="polite">
        {displayedTokens.join(byCharacter ? "" : " ")}
        {isStreaming && isBuffering && (
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: 2,
              height: "1em",
              marginLeft: 2,
              background: "currentColor",
              opacity: 0.5,
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
      style={{ lineHeight: 1.7, overflowWrap: "break-word" }}
    >
      {tokenElements.map(({ token, index, isNew }) =>
        isNew ? (
          <motion.span
            key={`${index}-${token}`}
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={transition}
            style={{
              display: "inline-block",
              whiteSpace: "pre-wrap",
            }}
          >
            {token}
            {!byCharacter && index < displayedTokens.length - 1 ? "\u00A0" : ""}
          </motion.span>
        ) : (
          <span
            key={`${index}-${token}`}
            style={{
              display: "inline-block",
              whiteSpace: "pre-wrap",
            }}
          >
            {token}
            {!byCharacter && index < displayedTokens.length - 1 ? "\u00A0" : ""}
          </span>
        ),
      )}
      {/* Blinking cursor during streaming */}
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
    </p>
  );
}
