"use client";

import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface SkeletonBlockProps {
  /** Skeleton variant matching common AI content types. */
  variant?: "message" | "code" | "markdown" | "card" | "table-row";
  /** Number of lines (for message/markdown variants). Defaults to 3. */
  lines?: number;
  /** Whether to animate the shimmer. Defaults to true. */
  animate?: boolean;
  className?: string;
}

// Injected once globally to avoid duplicate <style> tags
let shimmerInjected = false;
function ensureShimmerKeyframes() {
  if (shimmerInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = `@keyframes skeleton-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`;
  document.head.appendChild(style);
  shimmerInjected = true;
}

const shimmerBg =
  "linear-gradient(90deg, oklch(0.16 0.005 260) 25%, oklch(0.22 0.008 260) 50%, oklch(0.16 0.005 260) 75%)";
const staticBg = "oklch(0.16 0.005 260)";

function Line({
  width,
  height = 12,
  animate: shouldAnimate,
  prefersReduced,
}: {
  width: string;
  height?: number;
  animate: boolean;
  prefersReduced: boolean;
}) {
  const isAnimated = shouldAnimate && !prefersReduced;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        background: isAnimated ? shimmerBg : staticBg,
        backgroundSize: "200% 100%",
        animation: isAnimated ? "skeleton-shimmer 1.8s ease-in-out infinite" : "none",
      }}
    />
  );
}

/**
 * AI-aware loading skeletons matching common content types.
 *
 * Variants: message (chat bubble skeleton), code (code block),
 * markdown (mixed content), card (generic card), table-row.
 *
 * Uses a subtle shimmer gradient that signals "actively loading"
 * without the harshness of a spinner.
 */
export function SkeletonBlock({
  variant = "message",
  lines = 3,
  animate: shouldAnimate = true,
  className,
}: SkeletonBlockProps) {
  const prefersReduced = useReducedMotion();
  ensureShimmerKeyframes();

  // Pseudo-random widths for natural line variation
  const lineWidths = Array.from({ length: lines }, (_, i) => {
    const base = [92, 78, 85, 60, 95, 70, 88, 55];
    return `${base[i % base.length]}%`;
  });

  const renderVariant = () => {
    switch (variant) {
      case "message":
        return (
          <div style={{ display: "flex", gap: 12 }}>
            {/* Avatar */}
            <Line width="32px" height={32} animate={shouldAnimate} prefersReduced={prefersReduced} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Name */}
              <Line width="80px" height={10} animate={shouldAnimate} prefersReduced={prefersReduced} />
              {/* Lines */}
              {lineWidths.map((w, i) => (
                <Line key={i} width={w} animate={shouldAnimate} prefersReduced={prefersReduced} />
              ))}
            </div>
          </div>
        );

      case "code":
        return (
          <div
            style={{
              padding: 16,
              borderRadius: 10,
              background: "oklch(0.10 0.005 260)",
              border: "1px solid oklch(0.18 0.005 260 / 0.4)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* Code lines with indentation */}
            <Line width="35%" height={10} animate={shouldAnimate} prefersReduced={prefersReduced} />
            <div style={{ paddingLeft: 20 }}>
              <Line width="60%" height={10} animate={shouldAnimate} prefersReduced={prefersReduced} />
            </div>
            <div style={{ paddingLeft: 20 }}>
              <Line width="45%" height={10} animate={shouldAnimate} prefersReduced={prefersReduced} />
            </div>
            <div style={{ paddingLeft: 40 }}>
              <Line width="55%" height={10} animate={shouldAnimate} prefersReduced={prefersReduced} />
            </div>
            <Line width="20%" height={10} animate={shouldAnimate} prefersReduced={prefersReduced} />
          </div>
        );

      case "markdown":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Heading */}
            <Line width="45%" height={18} animate={shouldAnimate} prefersReduced={prefersReduced} />
            {/* Paragraph */}
            {lineWidths.map((w, i) => (
              <Line key={i} width={w} animate={shouldAnimate} prefersReduced={prefersReduced} />
            ))}
            {/* Code block */}
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: "oklch(0.10 0.005 260)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Line width="50%" height={10} animate={shouldAnimate} prefersReduced={prefersReduced} />
              <Line width="70%" height={10} animate={shouldAnimate} prefersReduced={prefersReduced} />
            </div>
            {/* More text */}
            <Line width="88%" animate={shouldAnimate} prefersReduced={prefersReduced} />
            <Line width="62%" animate={shouldAnimate} prefersReduced={prefersReduced} />
          </div>
        );

      case "card":
        return (
          <div
            style={{
              padding: 20,
              borderRadius: 14,
              background: "linear-gradient(135deg, oklch(0.14 0.008 260 / 0.9), oklch(0.10 0.005 260 / 0.8))",
              border: "1px solid oklch(0.22 0.01 260 / 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Line width="40%" height={14} animate={shouldAnimate} prefersReduced={prefersReduced} />
              <Line width="60px" height={24} animate={shouldAnimate} prefersReduced={prefersReduced} />
            </div>
            <Line width="90%" animate={shouldAnimate} prefersReduced={prefersReduced} />
            <Line width="75%" animate={shouldAnimate} prefersReduced={prefersReduced} />
          </div>
        );

      case "table-row":
        return (
          <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 0" }}>
            <Line width="24px" height={24} animate={shouldAnimate} prefersReduced={prefersReduced} />
            <Line width="30%" height={12} animate={shouldAnimate} prefersReduced={prefersReduced} />
            <Line width="20%" height={12} animate={shouldAnimate} prefersReduced={prefersReduced} />
            <Line width="15%" height={12} animate={shouldAnimate} prefersReduced={prefersReduced} />
            <div style={{ flex: 1 }} />
            <Line width="60px" height={28} animate={shouldAnimate} prefersReduced={prefersReduced} />
          </div>
        );
    }
  };

  return (
    <div className={className} role="status" aria-label="Loading content" aria-busy="true">
      {renderVariant()}
    </div>
  );
}
