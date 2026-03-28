"use client";

import { useRef, useEffect, useCallback } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface DataEdgeProps {
  /** SVG path d attribute (from React Flow's getBezierPath). */
  path: string;
  /** Whether particles are animated. Defaults to true. */
  animated?: boolean;
  /** Edge color. Defaults to blue. */
  color?: string;
  /** Number of particles. Defaults to 3. */
  particleCount?: number;
  /** Speed multiplier. Defaults to 1. */
  speed?: number;
  /** Stroke width of the path. Defaults to 2. */
  strokeWidth?: number;
  className?: string;
}

/**
 * Animated edge with flowing particles along the path.
 * Designed for agent workflow graphs to show data flow direction.
 *
 * Use with React Flow's custom edge renderer:
 * ```tsx
 * const edgeTypes = {
 *   data: ({ sourceX, sourceY, targetX, targetY }) => {
 *     const [path] = getBezierPath({ sourceX, sourceY, targetX, targetY });
 *     return <DataEdge path={path} animated />;
 *   }
 * };
 * ```
 */
export function DataEdge({
  path,
  animated = true,
  color = "oklch(0.6 0.12 250)",
  particleCount = 3,
  speed = 1,
  strokeWidth = 2,
  className,
}: DataEdgeProps) {
  const prefersReduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const particlesRef = useRef<SVGCircleElement[]>([]);
  const rafRef = useRef<number | undefined>(undefined);
  const offsetsRef = useRef<number[]>(
    Array.from({ length: particleCount }, (_, i) => i / particleCount),
  );

  const animateParticles = useCallback(
    () => {
      const pathEl = pathRef.current;
      if (!pathEl) return;

      const totalLength = pathEl.getTotalLength();
      const frameSpeed = (speed * 0.0005 * totalLength) / particleCount;

      for (let i = 0; i < particlesRef.current.length; i++) {
        const circle = particlesRef.current[i];
        if (!circle) continue;

        const offset = offsetsRef.current[i];
        if (offset === undefined) continue;

        const newOffset = (offset + frameSpeed / totalLength) % 1;
        offsetsRef.current[i] = newOffset;
        const point = pathEl.getPointAtLength(newOffset * totalLength);
        circle.setAttribute("cx", String(point.x));
        circle.setAttribute("cy", String(point.y));

        // Trail fade: leading particle is most opaque
        const trailOpacity = 0.4 + 0.6 * ((i + 1) / particleCount);
        circle.setAttribute("opacity", String(trailOpacity));
      }

      rafRef.current = requestAnimationFrame(animateParticles);
    },
    [speed, particleCount],
  );

  useEffect(() => {
    if (!animated || prefersReduced) return;

    rafRef.current = requestAnimationFrame(animateParticles);
    return () => {
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [animated, prefersReduced, animateParticles]);

  // Reset particle refs when count changes
  const setParticleRef = useCallback(
    (index: number) => (el: SVGCircleElement | null) => {
      if (el) particlesRef.current[index] = el;
    },
    [],
  );

  return (
    <svg
      ref={svgRef}
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
      }}
      aria-hidden="true"
    >
      {/* Base path */}
      <path
        ref={pathRef}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={0.3}
      />

      {/* Animated dash overlay */}
      {animated && !prefersReduced && (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray="6 4"
          strokeOpacity={0.6}
          style={{
            animation: "data-edge-flow 1.5s linear infinite",
          }}
        />
      )}

      {/* Particles */}
      {animated &&
        !prefersReduced &&
        Array.from({ length: particleCount }, (_, i) => (
          <circle
            key={i}
            ref={setParticleRef(i)}
            r={3}
            fill={color}
            opacity={0}
          />
        ))}

      <style>{`
        @keyframes data-edge-flow {
          to { stroke-dashoffset: -20; }
        }
      `}</style>
    </svg>
  );
}
