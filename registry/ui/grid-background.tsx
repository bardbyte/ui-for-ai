"use client";

import type { CSSProperties, ReactNode } from "react";

export interface GridBackgroundProps {
  /** Pattern type. */
  variant?: "dots" | "grid" | "cross";
  /** Cell size in pixels. Defaults to 24. */
  cellSize?: number;
  /** Pattern color. Defaults to currentColor at 15% opacity. */
  color?: string;
  /** Whether to show a radial gradient fade. */
  fade?: boolean;
  /** Fade direction. Defaults to "center". */
  fadeDirection?: "center" | "top" | "bottom";
  className?: string;
  children?: ReactNode;
}

function getBackgroundImage(
  variant: "dots" | "grid" | "cross",
  color: string,
): string {
  switch (variant) {
    case "dots":
      return `radial-gradient(circle, ${color} 1px, transparent 1px)`;
    case "grid":
      return [
        `linear-gradient(${color} 1px, transparent 1px)`,
        `linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      ].join(", ");
    case "cross":
      return [
        `radial-gradient(circle, ${color} 1px, transparent 1px)`,
        `linear-gradient(${color} 1px, transparent 1px)`,
        `linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      ].join(", ");
  }
}

function getMaskImage(
  fadeDirection: "center" | "top" | "bottom",
): string {
  switch (fadeDirection) {
    case "center":
      return "radial-gradient(ellipse at center, black 40%, transparent 100%)";
    case "top":
      return "linear-gradient(to bottom, black, transparent)";
    case "bottom":
      return "linear-gradient(to top, black, transparent)";
  }
}

/**
 * Subtle animated dot/grid/cross background with radial gradient fade.
 * Pure CSS — zero JS runtime cost.
 */
export function GridBackground({
  variant = "dots",
  cellSize = 24,
  color = "oklch(0.5 0 0 / 0.15)",
  fade = true,
  fadeDirection = "center",
  className,
  children,
}: GridBackgroundProps) {
  const bgImage = getBackgroundImage(variant, color);
  const bgSize = `${cellSize}px ${cellSize}px`;

  const style: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage: bgImage,
    backgroundSize: bgSize,
    ...(fade
      ? {
          maskImage: getMaskImage(fadeDirection),
          WebkitMaskImage: getMaskImage(fadeDirection),
        }
      : {}),
  };

  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
      aria-hidden="true"
    >
      <div style={style} />
      {children && (
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      )}
    </div>
  );
}
