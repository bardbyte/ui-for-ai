"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface CitationCardProps {
  /** Citation index (e.g., 1, 2, 3). Rendered as a superscript number. */
  index: number;
  /** Source document title. */
  title: string;
  /** Source document description or filename. */
  source?: string;
  /** The retrieved text chunk. */
  content: string;
  /** Relevance/confidence score (0-1). */
  score?: number;
  /** Page number or section reference. */
  page?: string;
  /** Link to the source. */
  href?: string;
  className?: string;
}

const spring = { type: "spring" as const, stiffness: 350, damping: 28 };

/**
 * Inline citation marker that expands to show the retrieved source chunk.
 *
 * Renders as a superscript `[1]` that, on hover/click, reveals a glassmorphic
 * popup with the source title, relevance score, chunk content, and link.
 *
 * Essential for RAG applications — the #4 pain point in AI interfaces.
 */
export function CitationCard({
  index,
  title,
  source,
  content,
  score,
  page,
  href,
  className,
}: CitationCardProps) {
  const prefersReduced = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const isHoveringRef = useRef(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    closeTimeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) setIsOpen(false);
    }, 150);
  }, []);

  const handleClick = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <span className={className} style={{ position: "relative", display: "inline" }}>
      {/* Superscript marker */}
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 18,
          height: 18,
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 600,
          fontFamily: "var(--font-geist-mono, monospace)",
          color: "oklch(0.78 0.12 250)",
          background: "oklch(0.72 0.14 250 / 0.1)",
          border: "1px solid oklch(0.72 0.14 250 / 0.2)",
          cursor: "pointer",
          verticalAlign: "super",
          lineHeight: 1,
          marginLeft: 1,
          marginRight: 1,
          transition: "background 150ms, border-color 150ms",
        }}
        aria-label={`Source ${index}: ${title}`}
        aria-expanded={isOpen}
      >
        {index}
      </button>

      {/* Expandable popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={spring}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              width: 320,
              zIndex: 50,
              borderRadius: 14,
              padding: 16,
              background: "linear-gradient(135deg, oklch(0.16 0.01 260 / 0.95), oklch(0.12 0.005 260 / 0.9))",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid oklch(0.25 0.01 260 / 0.4)",
              boxShadow: [
                "inset 0 1px 0 oklch(1.0 0 0 / 0.05)",
                "0 4px 16px oklch(0 0 0 / 0.3)",
                "0 12px 40px oklch(0 0 0 / 0.2)",
              ].join(", "),
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "oklch(0.9 0.005 260)",
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </div>
                {source && (
                  <div style={{ fontSize: 11, color: "oklch(0.45 0.01 260)", marginTop: 2 }}>
                    {source}
                    {page && <span> &middot; p.{page}</span>}
                  </div>
                )}
              </div>

              {/* Confidence score */}
              {score !== undefined && (
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-geist-mono, monospace)",
                    padding: "2px 6px",
                    borderRadius: 4,
                    background:
                      score >= 0.8
                        ? "oklch(0.72 0.16 155 / 0.12)"
                        : score >= 0.5
                          ? "oklch(0.78 0.14 75 / 0.12)"
                          : "oklch(0.55 0.08 260 / 0.12)",
                    color:
                      score >= 0.8
                        ? "oklch(0.72 0.16 155)"
                        : score >= 0.5
                          ? "oklch(0.78 0.14 75)"
                          : "oklch(0.55 0.08 260)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {Math.round(score * 100)}%
                </div>
              )}
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: "linear-gradient(90deg, transparent, oklch(0.25 0.01 260 / 0.4), transparent)",
                marginBottom: 10,
              }}
            />

            {/* Chunk content */}
            <div
              style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: "oklch(0.62 0.01 260)",
                maxHeight: 120,
                overflowY: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
