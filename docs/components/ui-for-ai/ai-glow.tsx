"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { AIState } from "@/hooks/use-ai-state";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface AIGlowProps {
  /** Current AI state drives the glow behavior. Defaults to "idle". */
  state?: AIState;
  /** Primary glow color. Defaults to blue. */
  color?: string;
  /** Intensity multiplier (0-1). Defaults to 0.5. */
  intensity?: number;
  /** Blur radius in pixels. Defaults to 80. */
  blur?: number;
  children?: ReactNode;
  className?: string;
}

interface BlobConfig {
  color: string;
  opacity: [number, number];
  scale: [number, number];
  x: [number, number];
  y: [number, number];
  duration: number;
}

const stateConfigs: Record<AIState, { blobs: [BlobConfig, BlobConfig, BlobConfig] }> = {
  idle: {
    blobs: [
      { color: "oklch(0.72 0.14 250)", opacity: [0.03, 0.06], scale: [0.8, 0.9], x: [-10, 10], y: [-5, 5], duration: 20 },
      { color: "oklch(0.65 0.20 280)", opacity: [0.02, 0.04], scale: [0.7, 0.8], x: [5, -5], y: [5, -5], duration: 25 },
      { color: "oklch(0.78 0.12 200)", opacity: [0.02, 0.03], scale: [0.6, 0.7], x: [-5, 5], y: [-10, 10], duration: 18 },
    ],
  },
  thinking: {
    blobs: [
      { color: "oklch(0.72 0.14 250)", opacity: [0.08, 0.18], scale: [0.9, 1.1], x: [-20, 20], y: [-10, 10], duration: 6 },
      { color: "oklch(0.65 0.20 280)", opacity: [0.06, 0.14], scale: [0.8, 1.0], x: [15, -15], y: [10, -10], duration: 8 },
      { color: "oklch(0.78 0.12 200)", opacity: [0.04, 0.10], scale: [0.7, 0.9], x: [-10, 10], y: [-15, 15], duration: 10 },
    ],
  },
  "deep-thinking": {
    blobs: [
      { color: "oklch(0.65 0.20 280)", opacity: [0.12, 0.28], scale: [1.0, 1.2], x: [-25, 25], y: [-15, 15], duration: 4 },
      { color: "oklch(0.72 0.14 250)", opacity: [0.10, 0.22], scale: [0.9, 1.15], x: [20, -20], y: [12, -12], duration: 5 },
      { color: "oklch(0.78 0.12 200)", opacity: [0.06, 0.15], scale: [0.8, 1.05], x: [-15, 15], y: [-20, 20], duration: 6 },
    ],
  },
  "tool-calling": {
    blobs: [
      { color: "oklch(0.78 0.12 200)", opacity: [0.10, 0.22], scale: [0.9, 1.05], x: [-15, 15], y: [-8, 8], duration: 3 },
      { color: "oklch(0.72 0.14 250)", opacity: [0.06, 0.14], scale: [0.8, 0.95], x: [10, -10], y: [8, -8], duration: 4 },
      { color: "oklch(0.65 0.20 280)", opacity: [0.04, 0.08], scale: [0.7, 0.85], x: [-8, 8], y: [-12, 12], duration: 5 },
    ],
  },
  streaming: {
    blobs: [
      { color: "oklch(0.72 0.14 250)", opacity: [0.06, 0.12], scale: [0.85, 1.0], x: [-30, 30], y: [-5, 5], duration: 3 },
      { color: "oklch(0.65 0.20 280)", opacity: [0.04, 0.08], scale: [0.8, 0.95], x: [25, -25], y: [5, -5], duration: 4 },
      { color: "oklch(0.78 0.12 200)", opacity: [0.03, 0.06], scale: [0.7, 0.85], x: [-20, 20], y: [-8, 8], duration: 5 },
    ],
  },
  complete: {
    blobs: [
      { color: "oklch(0.72 0.16 155)", opacity: [0.04, 0.08], scale: [0.8, 0.9], x: [-5, 5], y: [-3, 3], duration: 15 },
      { color: "oklch(0.72 0.14 250)", opacity: [0.02, 0.04], scale: [0.7, 0.8], x: [3, -3], y: [3, -3], duration: 18 },
      { color: "oklch(0.78 0.12 200)", opacity: [0.01, 0.03], scale: [0.6, 0.7], x: [-3, 3], y: [-5, 5], duration: 20 },
    ],
  },
  error: {
    blobs: [
      { color: "oklch(0.65 0.22 25)", opacity: [0.12, 0.25], scale: [0.9, 1.05], x: [-15, 15], y: [-8, 8], duration: 4 },
      { color: "oklch(0.55 0.18 15)", opacity: [0.06, 0.12], scale: [0.7, 0.85], x: [8, -8], y: [5, -5], duration: 6 },
      { color: "oklch(0.72 0.14 250)", opacity: [0.02, 0.04], scale: [0.6, 0.7], x: [-5, 5], y: [-5, 5], duration: 10 },
    ],
  },
};

function Blob({
  config,
  blur,
  intensity,
  prefersReduced,
}: {
  config: BlobConfig;
  blur: number;
  intensity: number;
  prefersReduced: boolean;
}) {
  return (
    <motion.div
      animate={
        prefersReduced
          ? {
              opacity: config.opacity[0] * intensity,
              scale: config.scale[0],
            }
          : {
              opacity: [config.opacity[0] * intensity, config.opacity[1] * intensity],
              scale: config.scale,
              x: config.x,
              y: config.y,
            }
      }
      transition={
        prefersReduced
          ? { duration: 0 }
          : {
              duration: config.duration,
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut" as const,
            }
      }
      style={{
        position: "absolute",
        inset: "-30%",
        borderRadius: "50%",
        background: `radial-gradient(ellipse at center, ${config.color}, transparent 70%)`,
        filter: `blur(${blur}px)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
}

/**
 * Multi-layered ambient glow with 3 independently-moving blobs.
 *
 * Each blob drifts on its own path, creating organic color mixing
 * via mix-blend-mode: screen. A noise texture overlay adds grain
 * for an organic, non-digital feel. Colors and intensity shift
 * based on AI state — thinking pulses blue/violet, error shifts
 * to red, complete settles to a soft green.
 */
export function AIGlow({
  state = "idle",
  color: _color,
  intensity = 0.5,
  blur = 80,
  children,
  className,
}: AIGlowProps) {
  void _color; // Reserved for custom color override in future
  const prefersReduced = useReducedMotion();
  const config = stateConfigs[state];

  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
      aria-hidden="true"
    >
      {/* Three blobs */}
      {config.blobs.map((blob, i) => (
        <Blob
          key={`${state}-${i}`}
          config={blob}
          blur={blur}
          intensity={intensity}
          prefersReduced={prefersReduced}
        />
      ))}

      {/* Noise texture overlay for organic feel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          pointerEvents: "none",
          zIndex: 1,
          opacity: 0.5,
        }}
      />

      {/* Children content */}
      {children && (
        <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
      )}
    </div>
  );
}
