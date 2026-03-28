"use client";

import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface Source {
  id: string;
  title: string;
  source?: string;
  content: string;
  score?: number;
  page?: string;
  href?: string;
}

export interface SourcePanelProps {
  /** Whether the panel is open. */
  open: boolean;
  /** Callback to close the panel. */
  onClose: () => void;
  /** Sources to display. */
  sources: Source[];
  /** Currently highlighted source ID (from clicking a citation). */
  activeSourceId?: string;
  className?: string;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 28 };

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 0.8 ? "oklch(0.72 0.16 155)" :
    score >= 0.5 ? "oklch(0.78 0.14 75)" :
    "oklch(0.55 0.08 260)";
  const bg =
    score >= 0.8 ? "oklch(0.72 0.16 155 / 0.1)" :
    score >= 0.5 ? "oklch(0.78 0.14 75 / 0.1)" :
    "oklch(0.55 0.08 260 / 0.1)";

  return (
    <span
      style={{
        fontSize: 10,
        fontFamily: "var(--font-geist-mono, monospace)",
        padding: "2px 6px",
        borderRadius: 4,
        background: bg,
        color,
        flexShrink: 0,
      }}
    >
      {Math.round(score * 100)}%
    </span>
  );
}

/**
 * Side panel showing all retrieved sources for a RAG response.
 *
 * Slides in from the right. Each source shows title, relevance score,
 * and the retrieved chunk. The active source (from clicking a CitationCard)
 * is highlighted with a blue left border.
 */
export function SourcePanel({
  open,
  onClose,
  sources,
  activeSourceId,
  className,
}: SourcePanelProps) {
  const prefersReduced = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={className}
          initial={prefersReduced ? { opacity: 0 } : { x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={prefersReduced ? { opacity: 0 } : { x: "100%", opacity: 0 }}
          transition={prefersReduced ? { duration: 0.15 } : spring}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: 380,
            maxWidth: "90vw",
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, oklch(0.12 0.008 260 / 0.98), oklch(0.08 0.005 260 / 0.95))",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderLeft: "1px solid oklch(0.22 0.01 260 / 0.4)",
            boxShadow: "-8px 0 32px oklch(0 0 0 / 0.3)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid oklch(0.20 0.01 260 / 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "oklch(0.9 0.005 260)" }}>
                Sources
              </div>
              <div style={{ fontSize: 11, color: "oklch(0.45 0.01 260)", marginTop: 2 }}>
                {sources.length} document{sources.length !== 1 ? "s" : ""} retrieved
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sources panel"
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                border: "1px solid oklch(0.25 0.01 260 / 0.4)",
                background: "oklch(0.14 0.005 260 / 0.6)",
                color: "oklch(0.6 0.01 260)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1={18} y1={6} x2={6} y2={18} />
                <line x1={6} y1={6} x2={18} y2={18} />
              </svg>
            </button>
          </div>

          {/* Source list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
            <AnimatePresence initial={false}>
              {sources.map((src, i) => {
                const isActive = src.id === activeSourceId;
                return (
                  <motion.div
                    key={src.id}
                    initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={prefersReduced ? { duration: 0 } : { ...spring, delay: i * 0.05 }}
                    style={{
                      padding: "14px 16px",
                      marginBottom: 8,
                      borderRadius: 12,
                      background: isActive
                        ? "oklch(0.72 0.14 250 / 0.06)"
                        : "oklch(0.14 0.008 260 / 0.5)",
                      border: `1px solid ${isActive ? "oklch(0.72 0.14 250 / 0.2)" : "oklch(0.20 0.01 260 / 0.3)"}`,
                      borderLeft: isActive
                        ? "3px solid oklch(0.72 0.14 250 / 0.6)"
                        : "1px solid oklch(0.20 0.01 260 / 0.3)",
                      transition: "background 200ms, border-color 200ms",
                    }}
                  >
                    {/* Source header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 550, color: "oklch(0.88 0.005 260)", letterSpacing: "-0.01em" }}>
                          {src.href ? (
                            <a href={src.href} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                              {src.title}
                            </a>
                          ) : (
                            src.title
                          )}
                        </div>
                        {(src.source || src.page) && (
                          <div style={{ fontSize: 11, color: "oklch(0.42 0.01 260)", marginTop: 2 }}>
                            {src.source}
                            {src.page && <span> &middot; p.{src.page}</span>}
                          </div>
                        )}
                      </div>
                      {src.score !== undefined && <ScoreBadge score={src.score} />}
                    </div>

                    {/* Chunk */}
                    <div
                      style={{
                        fontSize: 12,
                        lineHeight: 1.6,
                        color: "oklch(0.55 0.01 260)",
                        maxHeight: 80,
                        overflowY: "hidden",
                        maskImage: "linear-gradient(180deg, black 60%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(180deg, black 60%, transparent 100%)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {src.content}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
