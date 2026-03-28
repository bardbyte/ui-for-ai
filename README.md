# ui-for-ai

**Make AI interfaces feel alive.**

Drop-in animated components for streaming text, thinking indicators, agent workflows, and every AI state your app needs. Copy-paste. shadcn-compatible. Zero lock-in.

---

## The Problem

Every AI app looks the same. Vibe-coded interfaces are generic, lifeless, and indistinguishable. Magic UI and Aceternity UI make landing pages beautiful, but neither understands AI states — streaming, thinking, tool-calling, confidence, error.

## The Solution

19 purpose-built components + 4 hooks for AI interface patterns:

- **Streaming & Text** — `StreamingText`, `ThinkingIndicator`, `ReasoningTrace`, `StreamingMarkdown`
- **Agent Workflows** — `AgentNode`, `DataEdge`, `AgentTimeline`, `ToolCallCard`
- **Layout & Transitions** — `AnimatedTabs`, `StreamingLayout`, `MorphContainer`, `ArtifactPane`
- **Ambient & Background** — `AIGlow`, `GridBackground`, `ParticleField`
- **Data & Feedback** — `ProgressRing`, `TokenCounter`, `VoiceWaveform`
- **Interactive** — `CopyButton`

Every component:
- GPU-accelerated animations (transform, opacity, filter only)
- Spring physics over bezier curves
- `prefers-reduced-motion` respected
- Full accessibility (aria-live, semantic HTML, keyboard nav)
- TypeScript strict mode, zero `any` types

## Installation

```bash
# Install a single component
npx shadcn@latest add https://uiforai.dev/r/streaming-text.json

# Or copy-paste from the registry
```

## Quick Start

```tsx
import { StreamingText } from "@/components/ui-for-ai/streaming-text";

function Chat() {
  const { messages } = useChat(); // Vercel AI SDK

  return (
    <div>
      {messages.map((m) => (
        <StreamingText
          key={m.id}
          content={m.content}
          mode="blur-in"
          isStreaming={m.role === "assistant" && isLoading}
        />
      ))}
    </div>
  );
}
```

```tsx
import { ThinkingIndicator } from "@/components/ui-for-ai/thinking-indicator";

// 7 states: idle | thinking | deep-thinking | tool-calling | streaming | complete | error
<ThinkingIndicator state="thinking" />
```

```tsx
import { ReasoningTrace } from "@/components/ui-for-ai/reasoning-trace";

// Auto-opens during streaming, auto-collapses when done
<ReasoningTrace
  content={thinkingText}
  isStreaming={isThinking}
  durationSeconds={12}
/>
```

## Tech Stack

- React 19 + TypeScript (strict)
- Tailwind CSS v4
- Motion (Framer Motion) v12
- shadcn-compatible registry

## Dependencies

| Dep | Used By |
|-----|---------|
| `motion` ^12 | 16 of 19 components |
| `@xyflow/react` ^12 | AgentNode, DataEdge only |

## Components

### Streaming & Text

| Component | Description |
|-----------|-------------|
| `StreamingText` | Token-by-token reveal with fade, blur-in, slide-up, typewriter modes |
| `ThinkingIndicator` | 7-state AI indicator — not bouncing dots |
| `ReasoningTrace` | Collapsible chain-of-thought with spring animations |
| `StreamingMarkdown` | Markdown that handles incomplete blocks during streaming |

### Agent Workflows

| Component | Description |
|-----------|-------------|
| `AgentNode` | React Flow node with semantic states (running/success/fail/waiting) |
| `DataEdge` | React Flow edge with flowing particles |
| `AgentTimeline` | Vertical step timeline with live progress |
| `ToolCallCard` | Tool invocation with animated expansion |

### Layout & Transitions

| Component | Description |
|-----------|-------------|
| `AnimatedTabs` | Sliding indicator + content cross-fade |
| `StreamingLayout` | Container that smoothly grows with streaming content |
| `MorphContainer` | Smooth chat-to-canvas-to-code transitions |
| `ArtifactPane` | Split-pane with animated resize |

### Ambient & Background

| Component | Description |
|-----------|-------------|
| `AIGlow` | Ambient glow responding to AI state |
| `GridBackground` | Dots/grid/cross pattern — pure CSS, zero JS |
| `ParticleField` | Interactive Canvas particle background |

### Hooks

| Hook | Description |
|------|-------------|
| `useAIState` | Type-safe state machine for AI lifecycle |
| `useStreamingBuffer` | Decouples network jitter from visual presentation |
| `useReducedMotion` | SSR-safe reduced motion detection |
| `useAnimatedNumber` | Spring-animated number transitions |

## Philosophy

1. **Copy-paste first** ��� No npm lock-in. You own every line.
2. **AI-state-aware** — Components understand streaming, thinking, tool-calling, not just show/hide.
3. **Performance obsessed** — GPU-only animations. Springs, not beziers. 120fps target.
4. **Accessible by default** — Not an afterthought. Built into every component.

## License

MIT
