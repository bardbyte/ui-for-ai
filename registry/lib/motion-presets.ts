/**
 * Shared animation presets for ui-for-ai components.
 *
 * Import in any component:
 *   import { springs, easing, durations } from "../lib/motion-presets";
 */

/** Spring physics presets for Motion animations. */
export const springs = {
  /** Responsive, no overshoot. For status transitions, tab indicators. */
  snappy: { type: "spring", stiffness: 300, damping: 24 } as const,
  /** Slight overshoot. For entrance animations, popping elements. */
  bouncy: { type: "spring", stiffness: 400, damping: 15 } as const,
  /** Slow, weighted. For container resize, panel open/close. */
  gentle: { type: "spring", stiffness: 200, damping: 25 } as const,
  /** Tight, immediate. For button taps, small interactions. */
  stiff: { type: "spring", stiffness: 500, damping: 30 } as const,
  /** Height expansion (drawers, accordions). */
  expansion: { type: "spring", stiffness: 250, damping: 25 } as const,
} as const;

/** Cubic-bezier easing curves as tuples (for Motion transition.ease). */
export const easing = {
  /** Fast start, gentle stop. Apple-like feel. */
  out: [0.16, 1, 0.3, 1] as const,
  /** Smooth both ends. Linear-like feel. */
  inOut: [0.76, 0, 0.24, 1] as const,
  /** Subtle overshoot. For playful entrances. */
  overshoot: [0.34, 1.56, 0.64, 1] as const,
} as const;

/** Standard durations in seconds. */
export const durations = {
  /** Micro-interactions: icon swaps, small state changes. */
  fast: 0.15,
  /** Default: fades, slides, content transitions. */
  normal: 0.25,
  /** Deliberate: container morphs, view transitions. */
  slow: 0.4,
  /** Cinematic: page-level transitions. */
  slower: 0.6,
} as const;
