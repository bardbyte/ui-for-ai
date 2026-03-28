"use client";

import {
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface StreamingMarkdownProps {
  /** Markdown content (can be incomplete during streaming). */
  content: string;
  /** Whether content is still being streamed. */
  isStreaming?: boolean;
  className?: string;
}

type BlockType =
  | "heading"
  | "paragraph"
  | "code"
  | "list"
  | "blockquote"
  | "hr";

interface ParsedBlock {
  type: BlockType;
  content: string;
  level?: number;
  language?: string;
  isComplete: boolean;
}

function at(lines: string[], i: number): string {
  return lines[i] ?? "";
}

function parseMarkdownBlocks(markdown: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = markdown.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = at(lines, i);

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push({ type: "hr", content: "", isComplete: true });
      i++;
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        content: headingMatch[2] ?? "",
        level: (headingMatch[1] ?? "").length,
        isComplete: true,
      });
      i++;
      continue;
    }

    // Code block (fenced)
    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      let isComplete = false;
      i++;

      while (i < lines.length) {
        if (at(lines, i).startsWith("```")) {
          isComplete = true;
          i++;
          break;
        }
        codeLines.push(at(lines, i));
        i++;
      }

      blocks.push({
        type: "code",
        content: codeLines.join("\n"),
        language: language || undefined,
        isComplete,
      });
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && at(lines, i).startsWith("> ")) {
        quoteLines.push(at(lines, i).slice(2));
        i++;
      }
      blocks.push({
        type: "blockquote",
        content: quoteLines.join("\n"),
        isComplete: true,
      });
      continue;
    }

    // List (unordered or ordered)
    if (/^(\s*[-*+]|\s*\d+[.])\s/.test(line)) {
      const listLines: string[] = [];
      while (
        i < lines.length &&
        (/^(\s*[-*+]|\s*\d+[.])\s/.test(at(lines, i)) ||
          /^\s+/.test(at(lines, i)))
      ) {
        listLines.push(at(lines, i));
        i++;
      }
      blocks.push({
        type: "list",
        content: listLines.join("\n"),
        isComplete: true,
      });
      continue;
    }

    // Empty line — skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph (collect consecutive non-empty, non-special lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      at(lines, i).trim() !== "" &&
      !at(lines, i).startsWith("#") &&
      !at(lines, i).startsWith("```") &&
      !at(lines, i).startsWith("> ") &&
      !/^(\s*[-*+]|\s*\d+[.])\s/.test(at(lines, i)) &&
      !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(at(lines, i))
    ) {
      paraLines.push(at(lines, i));
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push({
        type: "paragraph",
        content: paraLines.join("\n"),
        isComplete: true,
      });
    }
  }

  return blocks;
}

/** Render inline markdown (bold, italic, code, links). */
function renderInline(text: string): ReactNode {
  // Process inline patterns in order of precedence
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={key++}
          style={{
            padding: "2px 6px",
            borderRadius: 4,
            background: "oklch(0.5 0 0 / 0.1)",
            fontSize: "0.9em",
            fontFamily: "monospace",
          }}
        >
          {codeMatch[1]}
        </code>,
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic
    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      parts.push(<em key={key++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Link
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.65 0.15 250)", textDecoration: "underline" }}
        >
          {linkMatch[1]}
        </a>,
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Plain text — advance one character
    const nextSpecial = remaining.slice(1).search(/[`*[]/)
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else {
      parts.push(remaining.slice(0, nextSpecial + 1));
      remaining = remaining.slice(nextSpecial + 1);
    }
  }

  return parts;
}

function renderBlock(
  block: ParsedBlock,
  index: number,
  isStreaming: boolean,
  prefersReduced: boolean,
): ReactNode {
  const entryAnimation = prefersReduced
    ? {}
    : {
        initial: { opacity: 0, y: 6 } as const,
        animate: { opacity: 1, y: 0 } as const,
        transition: {
          type: "spring" as const,
          stiffness: 300,
          damping: 25,
        },
      };

  const incompleteStyle: CSSProperties = !block.isComplete
    ? {
        borderRight: "2px solid oklch(0.6 0.15 250 / 0.5)",
        paddingRight: 8,
      }
    : {};

  switch (block.type) {
    case "hr":
      return (
        <motion.hr
          key={index}
          {...entryAnimation}
          style={{
            border: "none",
            borderTop: "1px solid oklch(0.5 0 0 / 0.15)",
            margin: "16px 0",
          }}
        />
      );

    case "heading": {
      const level = block.level ?? 1;
      const fontSizes: Record<number, number> = {
        1: 24,
        2: 20,
        3: 18,
        4: 16,
        5: 14,
        6: 13,
      };
      const headingStyle = {
        fontSize: fontSizes[level],
        fontWeight: 600,
        margin: "20px 0 8px",
        lineHeight: 1.3,
      };
      return (
        <motion.div key={index} {...entryAnimation}>
          {level === 1 && <h1 style={headingStyle}>{renderInline(block.content)}</h1>}
          {level === 2 && <h2 style={headingStyle}>{renderInline(block.content)}</h2>}
          {level === 3 && <h3 style={headingStyle}>{renderInline(block.content)}</h3>}
          {level === 4 && <h4 style={headingStyle}>{renderInline(block.content)}</h4>}
          {level === 5 && <h5 style={headingStyle}>{renderInline(block.content)}</h5>}
          {level >= 6 && <h6 style={headingStyle}>{renderInline(block.content)}</h6>}
        </motion.div>
      );
    }

    case "paragraph":
      return (
        <motion.p
          key={index}
          {...entryAnimation}
          style={{
            margin: "8px 0",
            lineHeight: 1.7,
            ...incompleteStyle,
          }}
        >
          {renderInline(block.content)}
        </motion.p>
      );

    case "code":
      return (
        <motion.div key={index} {...entryAnimation}>
          <pre
            style={{
              margin: "12px 0",
              padding: 16,
              borderRadius: 8,
              background: "oklch(0.15 0 0)",
              color: "oklch(0.85 0 0)",
              overflow: "auto",
              fontSize: 13,
              lineHeight: 1.6,
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
              ...incompleteStyle,
            }}
          >
            <code>{block.content}</code>
            {!block.isComplete && isStreaming && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: "1em",
                  background: "oklch(0.7 0.15 250)",
                  marginLeft: 2,
                  verticalAlign: "text-bottom",
                  animation: "streaming-md-blink 1s step-end infinite",
                }}
              />
            )}
          </pre>
          <style>{`@keyframes streaming-md-blink { 50% { opacity: 0 } }`}</style>
        </motion.div>
      );

    case "blockquote":
      return (
        <motion.blockquote
          key={index}
          {...entryAnimation}
          style={{
            margin: "12px 0",
            padding: "4px 16px",
            borderLeft: "3px solid oklch(0.6 0.15 250 / 0.5)",
            color: "oklch(0.6 0 0 / 0.8)",
            fontStyle: "italic",
          }}
        >
          {renderInline(block.content)}
        </motion.blockquote>
      );

    case "list": {
      const items = block.content.split("\n").filter(Boolean);
      const isOrdered = /^\s*\d+\./.test(items[0] ?? "");
      const Tag = isOrdered ? "ol" : "ul";

      return (
        <motion.div key={index} {...entryAnimation}>
          <Tag
            style={{
              margin: "8px 0",
              paddingLeft: 24,
              lineHeight: 1.7,
            }}
          >
            {items.map((item, i) => (
              <li key={i}>
                {renderInline(
                  item.replace(/^\s*[-*+]\s+/, "").replace(/^\s*\d+\.\s+/, ""),
                )}
              </li>
            ))}
          </Tag>
        </motion.div>
      );
    }
  }
}

/**
 * Markdown renderer that handles incomplete blocks during streaming.
 * Unclosed code fences render with a blinking cursor. New completed blocks
 * animate in with spring-based entrance animations.
 */
export function StreamingMarkdown({
  content,
  isStreaming = false,
  className,
}: StreamingMarkdownProps) {
  const prefersReduced = useReducedMotion();
  const prevBlockCountRef = useRef(0);

  const blocks = useMemo(() => parseMarkdownBlocks(content), [content]);

  useEffect(() => {
    prevBlockCountRef.current = blocks.length;
  }, [blocks.length]);

  if (!content) return null;

  return (
    <div
      className={className}
      aria-live="polite"
      style={{ overflowWrap: "break-word" }}
    >
      {blocks.map((block, i) =>
        renderBlock(block, i, isStreaming, prefersReduced),
      )}
    </div>
  );
}
