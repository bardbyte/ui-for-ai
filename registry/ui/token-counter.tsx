"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface TokenCounterProps {
  /** Current token count. */
  value: number;
  /** Maximum token limit. */
  max?: number;
  /** Label. Defaults to "tokens". */
  label?: string;
  /** Display variant. Defaults to "full". */
  variant?: "compact" | "full";
  /** Warning threshold (0-1). Defaults to 0.8. */
  warningThreshold?: number;
  className?: string;
}

function getBarColor(ratio: number, threshold: number): string {
  if (ratio >= 0.95) return "oklch(0.65 0.2 25)"; // red
  if (ratio >= threshold) return "oklch(0.7 0.15 80)"; // yellow
  return "oklch(0.7 0.15 250)"; // blue
}

/**
 * Animated token usage display with smooth number transitions
 * and color-coded thresholds. Shows bar in "full" variant.
 */
export function TokenCounter({
  value,
  max,
  label = "tokens",
  variant = "full",
  warningThreshold = 0.8,
  className,
}: TokenCounterProps) {
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(String(value));

  const springValue = useSpring(value, { stiffness: 100, damping: 20 });
  const formatted = useTransform(springValue, (v) =>
    Math.round(v).toLocaleString(),
  );

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = formatted.on("change", (v) => setDisplayValue(v));
    return unsubscribe;
  }, [formatted]);

  const ratio = max ? value / max : 0;
  const barColor = max ? getBarColor(ratio, warningThreshold) : "oklch(0.7 0.15 250)";

  if (variant === "compact") {
    return (
      <span
        className={className}
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${value} ${label}${max ? ` of ${max}` : ""}`}
        style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}
      >
        <span style={{ fontWeight: 600 }}>
          {prefersReduced ? value.toLocaleString() : displayValue}
        </span>
        {max && (
          <span style={{ color: "oklch(0.5 0 0)" }}>
            {" "}
            / {max.toLocaleString()}
          </span>
        )}
        <span style={{ color: "oklch(0.5 0 0)", marginLeft: 4 }}>
          {label}
        </span>
      </span>
    );
  }

  return (
    <div
      className={className}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`${value} ${label}${max ? ` of ${max}` : ""}`}
      style={{ fontSize: 13 }}
    >
      {/* Number display */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          marginBottom: max ? 6 : 0,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {prefersReduced ? value.toLocaleString() : displayValue}
        </span>
        {max && (
          <span style={{ color: "oklch(0.5 0 0)" }}>
            / {max.toLocaleString()}
          </span>
        )}
        <span style={{ color: "oklch(0.5 0 0)" }}>{label}</span>
      </div>

      {/* Bar */}
      {max && (
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "oklch(0.25 0 0)",
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${Math.min(ratio * 100, 100)}%` }}
            transition={
              prefersReduced
                ? { duration: 0 }
                : { type: "spring", stiffness: 100, damping: 20 }
            }
            style={{
              height: "100%",
              borderRadius: 2,
              background: barColor,
              transition: "background 300ms",
            }}
          />
        </div>
      )}
    </div>
  );
}
