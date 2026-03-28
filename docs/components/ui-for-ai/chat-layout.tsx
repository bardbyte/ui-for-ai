"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type CSSProperties,
  type FormEvent,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface ChatLayoutProps {
  /** Message elements to render in the scrollable area. */
  children: ReactNode;
  /** Whether the AI is currently generating. Shows typing indicator. */
  isGenerating?: boolean;
  /** Callback when user submits a message. */
  onSubmit?: (message: string) => void;
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Whether to auto-scroll to bottom on new messages. Defaults to true. */
  autoScroll?: boolean;
  /** Optional header content (model selector, title, etc.). */
  header?: ReactNode;
  /** Optional footer content below the input. */
  footer?: ReactNode;
  /** Disable input while generating. Defaults to true. */
  disableWhileGenerating?: boolean;
  className?: string;
}

const surface: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  background: "oklch(0.08 0.005 260)",
  color: "oklch(0.93 0.005 260)",
  overflow: "hidden",
  position: "relative",
};

const scrollAreaStyle: CSSProperties = {
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  scrollBehavior: "smooth",
};

const inputAreaStyle: CSSProperties = {
  padding: "12px 16px 16px",
  borderTop: "1px solid oklch(0.18 0.005 260 / 0.6)",
  background: "linear-gradient(180deg, oklch(0.08 0.005 260 / 0.0), oklch(0.08 0.005 260))",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  resize: "none",
  border: "1px solid oklch(0.22 0.01 260 / 0.5)",
  borderRadius: 12,
  padding: "12px 48px 12px 16px",
  fontSize: 14,
  lineHeight: 1.6,
  color: "oklch(0.93 0.005 260)",
  background: "linear-gradient(135deg, oklch(0.12 0.005 260 / 0.9), oklch(0.10 0.005 260 / 0.8))",
  backdropFilter: "blur(8px)",
  outline: "none",
  fontFamily: "inherit",
  maxHeight: 200,
  boxShadow: "inset 0 1px 0 oklch(1.0 0 0 / 0.03), 0 2px 8px oklch(0 0 0 / 0.15)",
};

const sendButtonStyle: CSSProperties = {
  position: "absolute",
  right: 28,
  bottom: 28,
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "none",
  background: "oklch(0.72 0.14 250)",
  color: "oklch(0.98 0 0)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "opacity 150ms, transform 150ms",
};

/**
 * Full composable chat layout with auto-scroll, auto-resize input,
 * scroll-to-bottom button, and typing indicator.
 *
 * Slot your StreamingText, ReasoningTrace, ToolCallCard, etc. as children.
 */
export function ChatLayout({
  children,
  isGenerating = false,
  onSubmit,
  placeholder = "Send a message...",
  autoScroll = true,
  header,
  footer,
  disableWhileGenerating = true,
  className,
}: ChatLayoutProps) {
  const prefersReduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isAtBottomRef = useRef(true);

  // Auto-resize textarea
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: prefersReduced ? "auto" : "smooth" });
  }, [prefersReduced]);

  // Track scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
      isAtBottomRef.current = gap < 80;
      setShowScrollButton(gap > 200);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll on new content
  useEffect(() => {
    if (autoScroll && isAtBottomRef.current) {
      scrollToBottom();
    }
  }, [children, autoScroll, scrollToBottom]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || (disableWhileGenerating && isGenerating)) return;
      onSubmit?.(trimmed);
      setInput("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    },
    [input, onSubmit, isGenerating, disableWhileGenerating],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as FormEvent);
      }
    },
    [handleSubmit],
  );

  const isDisabled = disableWhileGenerating && isGenerating;

  return (
    <div className={className} style={surface}>
      {/* Header */}
      {header && (
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid oklch(0.18 0.005 260 / 0.6)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {header}
        </div>
      )}

      {/* Scroll area */}
      <div ref={scrollRef} style={scrollAreaStyle}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
          {children}
        </div>
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={prefersReduced ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToBottom}
            type="button"
            aria-label="Scroll to bottom"
            style={{
              position: "absolute",
              bottom: 100,
              left: "50%",
              transform: "translateX(-50%)",
              width: 36,
              height: 36,
              borderRadius: 18,
              border: "1px solid oklch(0.25 0.01 260 / 0.5)",
              background: "oklch(0.14 0.008 260 / 0.9)",
              backdropFilter: "blur(8px)",
              color: "oklch(0.7 0.01 260)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px oklch(0 0 0 / 0.3)",
              zIndex: 10,
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div style={inputAreaStyle}>
        <form onSubmit={handleSubmit} style={{ position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              resize();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            style={{
              ...textareaStyle,
              opacity: isDisabled ? 0.5 : 1,
            }}
          />
          <motion.button
            type="submit"
            disabled={isDisabled || !input.trim()}
            whileTap={prefersReduced ? undefined : { scale: 0.92 }}
            style={{
              ...sendButtonStyle,
              opacity: input.trim() && !isDisabled ? 1 : 0.3,
            }}
            aria-label="Send message"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </motion.button>
        </form>
        {footer && <div style={{ marginTop: 8, fontSize: 12, color: "oklch(0.4 0.01 260)" }}>{footer}</div>}
      </div>
    </div>
  );
}
