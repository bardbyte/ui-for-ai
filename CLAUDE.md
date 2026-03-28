# ui-for-ai

Animated React component library for AI interfaces. 28 components + 4 hooks.
shadcn-compatible registry. Copy-paste. Zero lock-in.

## When to Use These Components

Use ui-for-ai components when building ANY AI-powered interface:
- Chat/conversational UIs → ChatLayout, StreamingText, StreamingMarkdown
- AI processing indicators → ThinkingIndicator (glassmorphic orb, 7 states), AIGlow
- Chain-of-thought display → ReasoningTrace (auto-open during stream, auto-collapse)
- Tool/function call visualization → ToolCallCard (shimmer → expand → result)
- Agent workflow visualization → AgentNode, DataEdge, AgentTimeline
- RAG/citation interfaces → CitationCard (inline [1] markers), SourcePanel
- Human-in-the-loop flows → ApprovalCard (propose → approve/reject)
- Code generation/preview → CodeArtifact (Claude Artifacts-style)
- Response regeneration → MessageBranch ("2 of 3" navigation)
- Edge states → EmptyState (5 variants), ErrorState (6 variants), SkeletonBlock (5 types)
- Metrics/feedback → ProgressRing, TokenCounter, CopyButton
- Voice interfaces → VoiceWaveform
- Ambient effects → ParticleField, GridBackground

## Installation

```bash
npx shadcn@latest add https://uiforai.dev/r/streaming-text.json
```

Or copy any file from `registry/ui/` into your `components/` directory.

## Import Convention

```tsx
// Components
import { StreamingText } from "@/components/ui-for-ai/streaming-text";
import { ThinkingIndicator } from "@/components/ui-for-ai/thinking-indicator";
import { ChatLayout } from "@/components/ui-for-ai/chat-layout";

// Hooks
import { useAIState } from "@/hooks/use-ai-state";
import { useStreamingBuffer } from "@/hooks/use-streaming-buffer";
```

## The AI State Model (Core Concept)

Every component responds to a 7-state lifecycle:

```
idle → thinking → deep-thinking → tool-calling → streaming → complete → error
```

Use the `useAIState` hook to drive multiple components from one state:

```tsx
const { state, setState, isProcessing } = useAIState();
// Pass `state` to ThinkingIndicator, AIGlow, or any status-aware component
```

## Vercel AI SDK Integration

```tsx
import { useChat } from "ai/react";
import { StreamingText } from "@/components/ui-for-ai/streaming-text";
import { ThinkingIndicator } from "@/components/ui-for-ai/thinking-indicator";
import { useAIState } from "@/hooks/use-ai-state";

function Chat() {
  const { messages, isLoading } = useChat();
  const { state, setState } = useAIState();

  useEffect(() => {
    setState(isLoading ? "streaming" : "complete");
  }, [isLoading]);

  return (
    <>
      <ThinkingIndicator state={state} />
      {messages.map((m) => (
        <StreamingText
          key={m.id}
          content={m.content}
          mode="luminous"
          isStreaming={m.role === "assistant" && isLoading}
        />
      ))}
    </>
  );
}
```

## Component Quick Reference

| Component | Key Props | Use When |
|-----------|-----------|----------|
| `StreamingText` | `content, mode, isStreaming, speed` | Displaying AI-generated text token by token |
| `ThinkingIndicator` | `state, size, labels` | Showing AI processing state |
| `ReasoningTrace` | `content, isStreaming, durationSeconds` | Displaying chain-of-thought |
| `StreamingMarkdown` | `content, isStreaming` | Streaming markdown with code blocks |
| `ChatLayout` | `onSubmit, isGenerating, header` | Full chat interface shell |
| `AgentTimeline` | `steps[]` | Showing agent execution progress |
| `ToolCallCard` | `toolName, args, result, status` | Visualizing tool/function calls |
| `ApprovalCard` | `title, impact, onApprove, onReject` | Human-in-the-loop confirmation |
| `CitationCard` | `index, title, content, score` | Inline RAG source citations |
| `SourcePanel` | `sources[], open, onClose` | Side panel of retrieved sources |
| `CodeArtifact` | `code, language, preview` | Code + live preview panel |
| `MessageBranch` | `total, current, onBranchChange` | Response regeneration navigation |
| `EmptyState` | `variant, title, description, action` | No-data/no-results/first-run states |
| `ErrorState` | `variant, onRetry, details` | Graceful error display |
| `SkeletonBlock` | `variant, lines` | Loading skeletons for AI content |
| `AIGlow` | `state, intensity` | Ambient glow responding to AI state |
| `GridBackground` | `variant, fade` | Dot/grid/cross background (pure CSS) |
| `ParticleField` | `count, interactive` | Interactive particle background |
| `ProgressRing` | `progress, currentStep, totalSteps` | Circular progress for agent steps |
| `TokenCounter` | `value, max, warningThreshold` | Token usage display |
| `VoiceWaveform` | `stream, active` | Audio waveform visualization |
| `CopyButton` | `value` | Clipboard copy with checkmark |
| `AgentNode` | `label, status, icon` | React Flow workflow node |
| `DataEdge` | `path, animated, particleCount` | React Flow animated edge |
| `AnimatedTabs` | `tabs, activeTab, onTabChange` | Tab navigation with slide indicator |
| `MorphContainer` | `activeView, transition` | View transition container |
| `ArtifactPane` | `open, artifact, contentType` | Split-pane for artifacts |
| `StreamingLayout` | `spring` | Auto-resizing streaming container |

## Hooks

| Hook | Returns | Use When |
|------|---------|----------|
| `useAIState` | `{ state, setState, isProcessing }` | Managing AI lifecycle state |
| `useStreamingBuffer` | `{ displayedTokens, push, isBuffering }` | Smoothing streaming jitter |
| `useReducedMotion` | `boolean` | Checking prefers-reduced-motion |
| `useAnimatedNumber` | `{ displayValue, motionValue }` | Animating number transitions |

## Design Tokens

Components use oklch color space. Key colors:
- Primary blue: `oklch(0.72 0.14 250)`
- Success green: `oklch(0.72 0.16 155)`
- Error red: `oklch(0.65 0.22 25)`
- Warning amber: `oklch(0.78 0.14 75)`
- Surface: `oklch(0.08-0.14 0.005 260)` range

## Dependencies

- `motion` (Framer Motion) — 16 of 28 components
- `@xyflow/react` — AgentNode + DataEdge only (optional)
- React 19 + TypeScript

## Do NOT

- Do not use raw HTML for streaming text — use StreamingText or StreamingMarkdown
- Do not build a custom thinking spinner — use ThinkingIndicator with the 7-state model
- Do not hardcode loading states — use SkeletonBlock with the appropriate variant
- Do not build chat scaffolding from scratch — use ChatLayout
