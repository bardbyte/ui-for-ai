"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface ProgressRingProps {
  /** Current progress (0-100). */
  progress: number;
  /** Current step number. */
  currentStep?: number;
  /** Total steps. */
  totalSteps?: number;
  /** Label text (shown in center). */
  label?: string;
  /** Size in pixels. Defaults to 64. */
  size?: number;
  /** Stroke width. Defaults to 4. */
  strokeWidth?: number;
  /** Color. Defaults to blue. */
  color?: string;
  className?: string;
}

/**
 * Circular progress indicator with spring physics.
 * Shows step count in center and smooth arc fill animation.
 */
export function ProgressRing({
  progress,
  currentStep,
  totalSteps,
  label,
  size = 64,
  strokeWidth = 4,
  color = "oklch(0.7 0.15 250)",
  className,
}: ProgressRingProps) {
  const prefersReduced = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const springProgress = useSpring(0, { stiffness: 100, damping: 20 });
  const dashOffset = useTransform(
    springProgress,
    (v) => circumference - (v / 100) * circumference,
  );

  useEffect(() => {
    springProgress.set(clampedProgress);
  }, [clampedProgress, springProgress]);

  const centerText =
    currentStep !== undefined && totalSteps !== undefined
      ? `${currentStep}/${totalSteps}`
      : label ?? `${Math.round(clampedProgress)}%`;

  if (prefersReduced) {
    const staticOffset =
      circumference - (clampedProgress / 100) * circumference;
    return (
      <div
        className={className}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={centerText}
        style={{
          position: "relative",
          width: size,
          height: size,
        }}
      >
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="oklch(0.3 0 0)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={staticOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.2,
            fontWeight: 600,
            color: "oklch(0.8 0 0)",
          }}
        >
          {centerText}
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={centerText}
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.3 0 0)"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      {/* Center text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.2,
          fontWeight: 600,
          color: "oklch(0.8 0 0)",
        }}
      >
        {centerText}
      </div>
    </div>
  );
}
