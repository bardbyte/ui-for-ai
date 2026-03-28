"use client";

import {
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface ParticleFieldProps {
  /** Number of particles. Defaults to 60. */
  count?: number;
  /** Particle color. Defaults to white at 40% opacity. */
  color?: string;
  /** Whether particles respond to mouse. Defaults to true. */
  interactive?: boolean;
  /** Connection line distance threshold in pixels. Defaults to 120. */
  connectionDistance?: number;
  /** Particle speed multiplier. Defaults to 1. */
  speed?: number;
  className?: string;
  children?: ReactNode;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

/**
 * Interactive particle background using Canvas 2D.
 * Particles drift, connect with lines when close, and respond to mouse.
 * GPU-composited (canvas is a single compositor layer).
 */
export function ParticleField({
  count = 60,
  color = "rgba(255, 255, 255, 0.4)",
  interactive = true,
  connectionDistance = 120,
  speed = 1,
  className,
  children,
}: ParticleFieldProps) {
  const prefersReduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number | undefined>(undefined);
  const sizeRef = useRef({ w: 0, h: 0 });

  const initParticles = useCallback(
    (w: number, h: number) => {
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5 * speed,
        vy: (Math.random() - 0.5) * 0.5 * speed,
        radius: Math.random() * 1.5 + 0.5,
      }));
    },
    [count, speed],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    ctx.clearRect(0, 0, w, h);

    const particles = particlesRef.current;
    const mouse = mouseRef.current;
    const connDist = connectionDistance;
    const connDistSq = connDist * connDist;

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!p) continue;

      if (!prefersReduced) {
        // Mouse repulsion
        if (interactive) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 10000) {
            // within 100px
            const dist = Math.sqrt(distSq);
            const force = (100 - dist) / 100;
            p.vx += (dx / dist) * force * 0.2;
            p.vy += (dy / dist) * force * 0.2;
          }
        }

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Dampen velocity
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Wrap around edges
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Draw connections (only check forward to avoid duplicates)
      if (!prefersReduced) {
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          if (!q) continue;
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < connDistSq) {
            const opacity = 1 - Math.sqrt(distSq) / connDist;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = color.replace(
              /[\d.]+\)$/,
              `${opacity * 0.3})`,
            );
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    if (!prefersReduced) {
      rafRef.current = requestAnimationFrame(draw);
    }
  }, [color, connectionDistance, interactive, prefersReduced]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      sizeRef.current = { w: rect.width, h: rect.height };
      initParticles(rect.width, rect.height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    resize();

    // Start animation
    rafRef.current = requestAnimationFrame(draw);

    // Mouse tracking
    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    if (interactive) {
      canvas.addEventListener("mousemove", handleMouse);
      canvas.addEventListener("mouseleave", handleLeave);
    }

    return () => {
      observer.disconnect();
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
      if (interactive) {
        canvas.removeEventListener("mousemove", handleMouse);
        canvas.removeEventListener("mouseleave", handleLeave);
      }
    };
  }, [draw, initParticles, interactive]);

  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        role="presentation"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: interactive ? "auto" : "none",
        }}
      />
      {children && (
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      )}
    </div>
  );
}
