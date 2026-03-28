"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface UseStreamingBufferOptions {
  /** Target tokens per second for visual output. Defaults to 40. */
  tokensPerSecond?: number;
  /** Delimiter to split on. Defaults to " " (words). Use "" for characters. */
  delimiter?: string;
}

export interface UseStreamingBufferReturn {
  /** The visually rendered tokens so far. */
  displayedTokens: string[];
  /** Push new raw content as stream data arrives. */
  push: (content: string) => void;
  /** Whether the buffer still has tokens to drain. */
  isBuffering: boolean;
  /** Reset the buffer and displayed tokens. */
  reset: () => void;
  /** The full displayed text joined. */
  displayedText: string;
}

/**
 * Decouples network arrival timing from visual presentation.
 * Maintains a token queue and drains it at a consistent visual rate
 * using requestAnimationFrame. Tokens arriving in bursts are visually
 * staggered; network pauses show a natural visual pause.
 */
export function useStreamingBuffer(
  options: UseStreamingBufferOptions = {},
): UseStreamingBufferReturn {
  const { tokensPerSecond = 40, delimiter = " " } = options;

  const [displayedTokens, setDisplayedTokens] = useState<string[]>([]);
  const queueRef = useRef<string[]>([]);
  const rafRef = useRef<number | undefined>(undefined);
  const lastDrainRef = useRef<number>(0);
  const processedRef = useRef<string>("");

  const msPerToken = 1000 / tokensPerSecond;

  const drain = useCallback(
    (timestamp: number) => {
      const elapsed = timestamp - lastDrainRef.current;

      if (elapsed >= msPerToken && queueRef.current.length > 0) {
        const tokensToShow = Math.max(
          1,
          Math.floor(elapsed / msPerToken),
        );
        const batch = queueRef.current.splice(0, tokensToShow);

        setDisplayedTokens((prev) => [...prev, ...batch]);
        lastDrainRef.current = timestamp;
      }

      if (queueRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(drain);
      } else {
        rafRef.current = undefined;
      }
    },
    [msPerToken],
  );

  const push = useCallback(
    (content: string) => {
      // Only process the new part of the content
      if (content.length <= processedRef.current.length) return;

      const newContent = content.slice(processedRef.current.length);
      processedRef.current = content;

      const newTokens =
        delimiter === ""
          ? newContent.split("")
          : newContent.split(delimiter).filter(Boolean);

      if (newTokens.length === 0) return;

      queueRef.current.push(...newTokens);

      // Start the drain loop if not already running
      if (rafRef.current === undefined) {
        lastDrainRef.current = performance.now();
        rafRef.current = requestAnimationFrame(drain);
      }
    },
    [delimiter, drain],
  );

  const reset = useCallback(() => {
    if (rafRef.current !== undefined) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
    queueRef.current = [];
    processedRef.current = "";
    lastDrainRef.current = 0;
    setDisplayedTokens([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    displayedTokens,
    push,
    isBuffering: queueRef.current.length > 0,
    reset,
    displayedText:
      delimiter === ""
        ? displayedTokens.join("")
        : displayedTokens.join(delimiter),
  };
}
