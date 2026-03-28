"use client";

import { useRef, useEffect, useCallback } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface VoiceWaveformProps {
  /** MediaStream from getUserMedia. */
  stream?: MediaStream;
  /** Number of bars. Defaults to 32. */
  barCount?: number;
  /** Bar width in pixels. Defaults to 3. */
  barWidth?: number;
  /** Gap between bars in pixels. Defaults to 2. */
  barGap?: number;
  /** Bar color. */
  color?: string;
  /** Minimum bar height (proportion 0-1). Defaults to 0.05. */
  minBarHeight?: number;
  /** Whether actively recording/playing. */
  active?: boolean;
  className?: string;
}

/**
 * Real-time audio waveform visualization using Web Audio API and Canvas.
 * Shows frequency bars that respond to audio input.
 * Falls back to a static idle state when no stream is provided.
 */
export function VoiceWaveform({
  stream,
  barCount = 32,
  barWidth = 3,
  barGap = 2,
  color = "oklch(0.7 0.15 250)",
  minBarHeight = 0.05,
  active = false,
  className,
}: VoiceWaveformProps) {
  const prefersReduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const smoothedRef = useRef<Float32Array>(new Float32Array(barCount));

  const totalWidth = barCount * (barWidth + barGap) - barGap;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const h = canvas.height / dpr;
    const w = canvas.width / dpr;

    ctx.clearRect(0, 0, w * dpr, h * dpr);

    const smoothed = smoothedRef.current;
    const smoothFactor = 0.3;

    if (analyser && active) {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);

      // Map frequency data to bars
      const binSize = Math.floor(data.length / barCount);
      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        for (let j = 0; j < binSize; j++) {
          sum += data[i * binSize + j] ?? 0;
        }
        const avg = sum / binSize / 255;
        const prev = smoothed[i] ?? 0;
        smoothed[i] = prev + (avg - prev) * smoothFactor;
      }
    } else {
      // Decay to idle
      for (let i = 0; i < barCount; i++) {
        const prev = smoothed[i] ?? 0;
        smoothed[i] = prev * 0.92;
      }
    }

    // Draw bars
    const startX = (w - totalWidth) / 2;
    ctx.save();
    ctx.scale(dpr, dpr);

    for (let i = 0; i < barCount; i++) {
      const value = Math.max(smoothed[i] ?? 0, minBarHeight);
      const barH = value * h * 0.8;
      const x = startX + i * (barWidth + barGap);
      const y = (h - barH) / 2;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, barWidth / 2);
      ctx.fill();
    }

    ctx.restore();

    if (!prefersReduced) {
      rafRef.current = requestAnimationFrame(draw);
    }
  }, [active, barCount, barGap, barWidth, color, minBarHeight, prefersReduced, totalWidth]);

  // Setup audio analyser
  useEffect(() => {
    if (!stream) return;

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    contextRef.current = audioCtx;
    analyserRef.current = analyser;

    return () => {
      source.disconnect();
      audioCtx.close();
      contextRef.current = null;
      analyserRef.current = null;
    };
  }, [stream]);

  // Setup canvas and animation
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
    };

    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    resize();

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: totalWidth + 16,
        height: 48,
      }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Audio waveform visualization"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
