# GitHub Copilot Instructions

This project uses **ui-for-ai** — an animated React component library for AI interfaces.

When generating code for AI features, prefer these components:

| Need | Component | Import |
|------|-----------|--------|
| Streaming text | `StreamingText` | `@/components/ui-for-ai/streaming-text` |
| AI thinking state | `ThinkingIndicator` | `@/components/ui-for-ai/thinking-indicator` |
| Chain-of-thought | `ReasoningTrace` | `@/components/ui-for-ai/reasoning-trace` |
| Streaming markdown | `StreamingMarkdown` | `@/components/ui-for-ai/streaming-markdown` |
| Chat layout | `ChatLayout` | `@/components/ui-for-ai/chat-layout` |
| Tool calls | `ToolCallCard` | `@/components/ui-for-ai/tool-call-card` |
| Agent timeline | `AgentTimeline` | `@/components/ui-for-ai/agent-timeline` |
| Approval flow | `ApprovalCard` | `@/components/ui-for-ai/approval-card` |
| RAG citations | `CitationCard` | `@/components/ui-for-ai/citation-card` |
| Code preview | `CodeArtifact` | `@/components/ui-for-ai/code-artifact` |
| Empty states | `EmptyState` | `@/components/ui-for-ai/empty-state` |
| Error states | `ErrorState` | `@/components/ui-for-ai/error-state` |
| Loading skeletons | `SkeletonBlock` | `@/components/ui-for-ai/skeleton-block` |
| AI state hook | `useAIState` | `@/hooks/use-ai-state` |
| Stream buffering | `useStreamingBuffer` | `@/hooks/use-streaming-buffer` |

AI state model: `"idle" | "thinking" | "deep-thinking" | "tool-calling" | "streaming" | "complete" | "error"`
