"use client";

import { useEffect, useState } from "react";
import { useSpring, useTransform, type MotionValue } from "motion/react";

export interface UseAnimatedNumberOptions {
  /** Spring stiffness. Defaults to 100. */
  stiffness?: number;
  /** Spring damping. Defaults to 20. */
  damping?: number;
  /** Number of decimal places. Defaults to 0. */
  precision?: number;
}

/**
 * Spring-animated number transitions.
 * Returns a formatted string that smoothly counts between values.
 */
export function useAnimatedNumber(
  value: number,
  options: UseAnimatedNumberOptions = {},
): { displayValue: string; motionValue: MotionValue<number> } {
  const { stiffness = 100, damping = 20, precision = 0 } = options;
  const springValue = useSpring(value, { stiffness, damping });
  const [displayValue, setDisplayValue] = useState(value.toFixed(precision));

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  const formatted = useTransform(springValue, (v) => v.toFixed(precision));

  useEffect(() => {
    const unsubscribe = formatted.on("change", (v) => {
      setDisplayValue(v);
    });
    return unsubscribe;
  }, [formatted]);

  return { displayValue, motionValue: springValue };
}
