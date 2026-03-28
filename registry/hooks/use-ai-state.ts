"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";

export type AIState =
  | "idle"
  | "thinking"
  | "deep-thinking"
  | "tool-calling"
  | "streaming"
  | "complete"
  | "error";

export interface UseAIStateOptions {
  /** Initial state. Defaults to "idle". */
  initialState?: AIState;
  /** Auto-transition to idle after complete (ms). Set 0 to disable. Defaults to 3000. */
  resetDelay?: number;
}

export interface UseAIStateReturn {
  state: AIState;
  setState: (state: AIState) => void;
  /** True when thinking, deep-thinking, tool-calling, or streaming. */
  isProcessing: boolean;
  isIdle: boolean;
  isError: boolean;
  isComplete: boolean;
}

const PROCESSING_STATES: ReadonlySet<AIState> = new Set([
  "thinking",
  "deep-thinking",
  "tool-calling",
  "streaming",
]);

/**
 * Type-safe state machine for AI processing lifecycle.
 * Provides derived booleans and optional auto-reset from complete to idle.
 */
export function useAIState(
  options: UseAIStateOptions = {},
): UseAIStateReturn {
  const { initialState = "idle", resetDelay = 3000 } = options;
  const [state, setStateRaw] = useState<AIState>(initialState);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setState = useCallback(
    (next: AIState) => {
      setStateRaw(next);

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = undefined;
      }

      if (next === "complete" && resetDelay > 0) {
        resetTimerRef.current = setTimeout(() => {
          setStateRaw("idle");
        }, resetDelay);
      }
    },
    [resetDelay],
  );

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return useMemo(
    () => ({
      state,
      setState,
      isProcessing: PROCESSING_STATES.has(state),
      isIdle: state === "idle",
      isError: state === "error",
      isComplete: state === "complete",
    }),
    [state, setState],
  );
}
