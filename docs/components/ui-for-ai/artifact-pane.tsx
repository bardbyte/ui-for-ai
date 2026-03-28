"use client";

import { useRef, useState, useCallback, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface ArtifactPaneProps {
  /** Whether the pane is open. */
  open: boolean;
  /** Callback when open state changes. */
  onOpenChange: (open: boolean) => void;
  /** Default width as percentage (0-100). Defaults to 50. */
  defaultWidth?: number;
  /** Minimum width in pixels. Defaults to 200. */
  minWidth?: number;
  /** Maximum width in pixels. Defaults to 800. */
  maxWidth?: number;
  /** Content type indicator. */
  contentType?: "code" | "document" | "image" | "chart" | "custom";
  /** Pane position. Defaults to "right". */
  position?: "right" | "left";
  /** The main content (chat side). */
  children: ReactNode;
  /** The artifact content (pane side). */
  artifact: ReactNode;
  className?: string;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const typeIcons: Record<string, string> = {
  code: "{ }",
  document: "Doc",
  image: "Img",
  chart: "Chart",
  custom: "",
};

/**
 * Split-pane layout with animated resize handle.
 * Opens smoothly to reveal artifact content alongside chat.
 * Supports drag-to-resize and content type indicators.
 */
export function ArtifactPane({
  open,
  onOpenChange,
  defaultWidth = 50,
  minWidth = 200,
  maxWidth = 800,
  contentType,
  position = "right",
  children,
  artifact,
  className,
}: ArtifactPaneProps) {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [paneWidth, setPaneWidth] = useState<number | null>(null);
  const isDraggingRef = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;

      const onMouseMove = (ev: MouseEvent) => {
        if (!isDraggingRef.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x =
          position === "right"
            ? rect.right - ev.clientX
            : ev.clientX - rect.left;
        const clamped = Math.min(Math.max(x, minWidth), maxWidth);
        setPaneWidth(clamped);
      };

      const onMouseUp = () => {
        isDraggingRef.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [minWidth, maxWidth, position],
  );

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const resolvedWidth = paneWidth
    ? `${paneWidth}px`
    : `${defaultWidth}%`;

  const paneContent = (
    <div style={{ height: "100%", overflow: "auto" }}>
      {/* Type indicator badge */}
      {contentType && typeIcons[contentType] && (
        <div
          style={{
            position: "absolute",
            top: 8,
            [position === "right" ? "left" : "right"]: 8,
            padding: "2px 8px",
            borderRadius: 4,
            background: "oklch(0.5 0 0 / 0.1)",
            fontSize: 11,
            color: "oklch(0.6 0 0)",
            zIndex: 2,
          }}
        >
          {typeIcons[contentType]}
        </div>
      )}
      {artifact}
    </div>
  );

  const isRight = position === "right";

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: "flex",
        flexDirection: isRight ? "row" : "row-reverse",
        height: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        {children}
      </div>

      {/* Pane */}
      <AnimatePresence initial={false}>
        {open && (
          <>
            {/* Resize handle */}
            <motion.div
              initial={prefersReduced ? undefined : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReduced ? undefined : { opacity: 0 }}
              onMouseDown={handleMouseDown}
              role="separator"
              aria-orientation="vertical"
              tabIndex={0}
              style={{
                width: 4,
                cursor: "col-resize",
                background: "oklch(0.5 0 0 / 0.1)",
                transition: "background 150ms",
                flexShrink: 0,
                zIndex: 3,
              }}
              whileHover={{ background: "oklch(0.6 0.1 250 / 0.4)" }}
            />

            {/* Artifact pane */}
            <motion.div
              initial={
                prefersReduced
                  ? undefined
                  : { width: 0, opacity: 0 }
              }
              animate={{ width: resolvedWidth, opacity: 1 }}
              exit={
                prefersReduced
                  ? undefined
                  : { width: 0, opacity: 0 }
              }
              transition={prefersReduced ? { duration: 0 } : spring}
              style={{
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
                borderLeft: isRight
                  ? "none"
                  : "1px solid oklch(0.5 0 0 / 0.1)",
                borderRight: isRight
                  ? "none"
                  : "none",
              }}
            >
              {paneContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
