"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useMemo } from "react";
import type { AIState } from "../hooks/use-ai-state";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface AIGlowProps {
  /** Current AI state drives the glow behavior. Defaults to "idle". */
  state?: AIState;
  /** Glow color in oklch/hex/rgb. Defaults to blue. */
  color?: string;
  /** Intensity multiplier (0-1). Defaults to 0.5. */
  intensity?: number;
  /** Whether to render as overlay (absolute positioned) or container (wraps children). */
  asOverlay?: boolean;
  /** Blur radius in pixels. Defaults to 80. */
  blur?: number;
  children?: ReactNode;
  className?: string;
}

const stateConfig: Record<
  AIState,
  { opacity: number; scale: number; speed: number }
> = {
  idle: { opacity: 0.05, scale: 1, speed: 0 },
  thinking: { opacity: 0.2, scale: 1.05, speed: 3 },
  "deep-thinking": { opacity: 0.35, scale: 1.1, speed: 2 },
  "tool-calling": { opacity: 0.25, scale: 1, speed: 4 },
  streaming: { opacity: 0.15, scale: 1.02, speed: 1.5 },
  complete: { opacity: 0.05, scale: 1, speed: 0 },
  error: { opacity: 0.3, scale: 1.05, speed: 0 },
};

const errorColor = "oklch(0.65 0.25 25)";
const completeColor = "oklch(0.6 0.15 145)";

/**
 * Ambient glow effect that responds to AI state.
 * Thinking pulses gently, streaming flows, error shifts red.
 * Uses CSS blur for soft diffusion — purely decorative.
 */
export function AIGlow({
  state = "idle",
  color = "oklch(0.6 0.18 250)",
  intensity = 0.5,
  asOverlay = false,
  blur = 80,
  children,
  className,
}: AIGlowProps) {
  const prefersReduced = useReducedMotion();
  const config = stateConfig[state];
  const effectiveIntensity = config.opacity * intensity;

  const resolvedColor = useMemo(() => {
    if (state === "error") return errorColor;
    if (state === "complete") return completeColor;
    return color;
  }, [state, color]);

  // Pulse animation for thinking states
  const pulseProgress = useMotionValue(0);
  const pulseOpacity = useTransform(
    pulseProgress,
    [0, 0.5, 1],
    [
      effectiveIntensity * 0.7,
      effectiveIntensity,
      effectiveIntensity * 0.7,
    ],
  );
  const pulseScale = useTransform(
    pulseProgress,
    [0, 0.5, 1],
    [config.scale * 0.98, config.scale, config.scale * 0.98],
  );

  useEffect(() => {
    if (prefersReduced || config.speed === 0) {
      pulseProgress.set(0.5);
      return;
    }

    const controls = animate(pulseProgress, [0, 1], {
      duration: config.speed,
      repeat: Infinity,
      ease: "easeInOut",
    });

    return () => controls.stop();
  }, [config.speed, prefersReduced, pulseProgress]);

  const glowStyle: CSSProperties = {
    position: "absolute",
    inset: asOverlay ? 0 : "-20%",
    borderRadius: "50%",
    background: `radial-gradient(ellipse at center, ${resolvedColor}, transparent 70%)`,
    filter: `blur(${blur}px)`,
    pointerEvents: "none",
    zIndex: 0,
  };

  const containerStyle: CSSProperties = {
    position: "relative",
    ...(asOverlay
      ? { position: "absolute" as const, inset: 0, pointerEvents: "none" as const }
      : {}),
  };

  if (prefersReduced) {
    return (
      <div className={className} style={containerStyle} aria-hidden="true">
        <div
          style={{
            ...glowStyle,
            opacity: effectiveIntensity,
            transform: `scale(${config.scale})`,
          }}
        />
        {children && (
          <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        )}
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle} aria-hidden="true">
      <motion.div
        style={{
          ...glowStyle,
          opacity: pulseOpacity,
          scale: pulseScale,
        }}
        animate={{
          background: `radial-gradient(ellipse at center, ${resolvedColor}, transparent 70%)`,
        }}
        transition={{ duration: 0.6 }}
      />
      {children && (
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      )}
    </div>
  );
}
