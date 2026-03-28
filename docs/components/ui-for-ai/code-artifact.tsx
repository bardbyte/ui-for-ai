"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface CodeArtifactProps {
  /** The code content. */
  code: string;
  /** Programming language for display. */
  language?: string;
  /** Optional filename. */
  filename?: string;
  /** Whether code is still being generated. */
  isStreaming?: boolean;
  /** Rendered preview of the code (e.g., a React component preview). */
  preview?: React.ReactNode;
  /** Show line numbers. Defaults to true. */
  lineNumbers?: boolean;
  className?: string;
}

/**
 * Live code preview panel inspired by Claude Artifacts.
 *
 * Shows syntax-highlighted code on the left and a live preview on the right
 * (or toggleable via tabs). Supports streaming code, line numbers, copy,
 * and download.
 */
export function CodeArtifact({
  code,
  language = "typescript",
  filename,
  isStreaming = false,
  preview,
  lineNumbers = true,
  className,
}: CodeArtifactProps) {
  const prefersReduced = useReducedMotion();
  const [activeView, setActiveView] = useState<"code" | "preview">(preview ? "preview" : "code");
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const lines = code.split("\n");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleDownload = useCallback(() => {
    const ext = language === "typescript" ? "ts" : language === "python" ? "py" : language;
    const name = filename ?? `code.${ext}`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, language, filename]);

  return (
    <div
      className={className}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        background: "linear-gradient(135deg, oklch(0.12 0.008 260 / 0.95), oklch(0.08 0.005 260 / 0.9))",
        border: "1px solid oklch(0.22 0.01 260 / 0.4)",
        boxShadow: [
          "inset 0 1px 0 oklch(1.0 0 0 / 0.04)",
          "0 4px 16px oklch(0 0 0 / 0.2)",
          "0 8px 32px oklch(0 0 0 / 0.15)",
        ].join(", "),
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid oklch(0.20 0.01 260 / 0.4)",
          background: "oklch(0.10 0.005 260 / 0.5)",
        }}
      >
        {/* Left: filename + language badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {filename && (
            <span style={{ fontSize: 12, fontWeight: 500, color: "oklch(0.75 0.01 260)", fontFamily: "var(--font-geist-mono, monospace)" }}>
              {filename}
            </span>
          )}
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-geist-mono, monospace)",
              padding: "2px 6px",
              borderRadius: 4,
              background: "oklch(0.72 0.14 250 / 0.1)",
              color: "oklch(0.72 0.14 250)",
            }}
          >
            {language}
          </span>
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: "oklch(0.72 0.14 250)",
              }}
            />
          )}
        </div>

        {/* Right: view toggle + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {preview && (
            <div
              style={{
                display: "flex",
                borderRadius: 6,
                border: "1px solid oklch(0.22 0.01 260 / 0.4)",
                overflow: "hidden",
              }}
            >
              {(["code", "preview"] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setActiveView(view)}
                  style={{
                    padding: "4px 10px",
                    fontSize: 11,
                    border: "none",
                    background: activeView === view ? "oklch(0.20 0.01 260 / 0.6)" : "transparent",
                    color: activeView === view ? "oklch(0.85 0.005 260)" : "oklch(0.48 0.01 260)",
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "background 150ms",
                  }}
                >
                  {view === "code" ? "Code" : "Preview"}
                </button>
              ))}
            </div>
          )}

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? "Copied" : "Copy code"}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "1px solid oklch(0.22 0.01 260 / 0.3)",
              background: "transparent",
              color: copied ? "oklch(0.72 0.16 155)" : "oklch(0.50 0.01 260)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 200ms",
            }}
          >
            {copied ? (
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x={9} y={9} width={13} height={13} rx={2} ry={2} />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download code"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "1px solid oklch(0.22 0.01 260 / 0.3)",
              background: "transparent",
              color: "oklch(0.50 0.01 260)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1={12} y1={15} x2={12} y2={3} />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait" initial={false}>
        {activeView === "code" ? (
          <motion.div
            key="code"
            initial={prefersReduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <pre
              ref={codeRef}
              style={{
                margin: 0,
                padding: "16px 0",
                overflowX: "auto",
                fontSize: 13,
                lineHeight: 1.65,
                fontFamily: 'var(--font-geist-mono, ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace)',
                color: "oklch(0.82 0.01 260)",
                maxHeight: 480,
                overflowY: "auto",
              }}
            >
              <code>
                {lines.map((line, i) => (
                  <div key={i} style={{ display: "flex", minHeight: "1.65em" }}>
                    {lineNumbers && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 48,
                          textAlign: "right",
                          paddingRight: 16,
                          color: "oklch(0.32 0.01 260)",
                          userSelect: "none",
                          flexShrink: 0,
                          fontSize: 12,
                        }}
                      >
                        {i + 1}
                      </span>
                    )}
                    <span style={{ paddingRight: 16 }}>
                      {line || "\n"}
                    </span>
                  </div>
                ))}
              </code>
            </pre>

            {/* Streaming cursor */}
            {isStreaming && (
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{
                  width: 7,
                  height: 2,
                  borderRadius: 1,
                  background: "oklch(0.72 0.14 250)",
                  marginLeft: lineNumbers ? 56 : 16,
                  marginBottom: 16,
                  boxShadow: "0 0 6px oklch(0.72 0.14 250 / 0.5)",
                }}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={prefersReduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              padding: 20,
              minHeight: 200,
              background: "oklch(0.98 0 0)",
              color: "oklch(0.15 0 0)",
            }}
          >
            {preview}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
