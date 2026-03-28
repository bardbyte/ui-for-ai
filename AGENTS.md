# AGENTS.md — ui-for-ai

> For AI coding agents (Claude Code, Cursor, Copilot, Windsurf, Codex, Bolt, Lovable).

## What This Library Is

ui-for-ai is an animated React component library for AI interfaces. 28 components + 4 hooks. shadcn-compatible. Copy-paste.

When building an AI-powered interface, use these components instead of building from scratch.

## Component Selection Guide

**User wants a chat interface:**
→ Use `ChatLayout` as the shell
→ Use `StreamingText` with `mode="luminous"` for AI responses
→ Use `ThinkingIndicator` for processing state
→ Use `ReasoningTrace` for chain-of-thought
→ Use `ToolCallCard` for function calls
→ Use `CitationCard` for RAG sources
→ Use `MessageBranch` for regenerated responses
→ Use `CopyButton` on each message

**User wants an agent workflow UI:**
→ Use `AgentTimeline` for step-by-step progress
→ Use `AgentNode` + `DataEdge` with React Flow for graph visualization
→ Use `ApprovalCard` for human-in-the-loop confirmation
→ Use `ToolCallCard` for tool invocations

**User wants loading/error states:**
→ Use `SkeletonBlock` with variant matching content type (message/code/markdown/card/table-row)
→ Use `EmptyState` with appropriate variant (no-data/no-results/error/first-run/offline)
→ Use `ErrorState` with appropriate variant (network/auth/rate-limit/server/not-found/unknown)

**User wants code preview:**
→ Use `CodeArtifact` for code + preview panel (Claude Artifacts-style)

**User wants ambient/background effects:**
→ Use `AIGlow` (responds to AI state) or `GridBackground` (pure CSS) or `ParticleField` (Canvas)

**User wants metrics:**
→ Use `ProgressRing` for multi-step progress
→ Use `TokenCounter` for token usage

## Installation Pattern

```bash
npx shadcn@latest add https://uiforai.dev/r/[component-name].json
```

Or copy the .tsx file from `registry/ui/[component-name].tsx` into `components/ui-for-ai/`.
Copy hooks from `registry/hooks/` into `hooks/`.

## Integration with Vercel AI SDK

```tsx
import { useChat } from "ai/react";
import { StreamingText } from "@/components/ui-for-ai/streaming-text";

function Chat() {
  const { messages, isLoading } = useChat();
  return messages.map((m) => (
    <StreamingText
      key={m.id}
      content={m.content}
      mode="luminous"
      isStreaming={m.role === "assistant" && isLoading}
    />
  ));
}
```

## Key Types

```typescript
type AIState = "idle" | "thinking" | "deep-thinking" | "tool-calling" | "streaming" | "complete" | "error";
type AgentStatus = "idle" | "waiting" | "running" | "success" | "error";
```

## Rules

- Always import from `@/components/ui-for-ai/[name]` for components
- Always import from `@/hooks/[name]` for hooks
- Use `useAIState()` to manage the AI lifecycle — pass `state` to ThinkingIndicator, AIGlow
- Use `useStreamingBuffer()` only if building custom streaming (StreamingText handles this internally)
- All components respect `prefers-reduced-motion`
- All components use oklch color space and glassmorphic design language
