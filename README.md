<p align="center">
  <img src="https://img.shields.io/badge/components-19-blue?style=flat-square" alt="19 Components" />
  <img src="https://img.shields.io/badge/hooks-4-purple?style=flat-square" alt="4 Hooks" />
  <img src="https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square" alt="TypeScript Strict" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/shadcn-compatible-black?style=flat-square" alt="shadcn Compatible" />
</p>

<h1 align="center">ui-for-ai</h1>

<p align="center">
  <strong>Make AI interfaces feel alive.</strong><br/>
  Drop-in animated components for streaming, thinking, agent workflows,<br/>
  and every AI state your app needs.
</p>

<p align="center">
  Copy-paste &bull; shadcn-compatible &bull; Zero lock-in &bull; GPU-accelerated &bull; Accessible
</p>

---

## Why This Exists

Every AI app looks the same. **25% of YC W25 founders** have 95% AI-generated code. The result? Generic, lifeless interfaces built from the same shadcn defaults.

Magic UI and Aceternity UI make landing pages beautiful. But neither understands **AI states** -- streaming tokens, thinking indicators, tool-calling, agent workflows, confidence levels.

**ui-for-ai** fills that gap. 19 components + 4 hooks purpose-built for the patterns that make AI interfaces feel premium.

```
Before ui-for-ai:                  After ui-for-ai:

  Loading...                         [    Thinking deeply...    ]
  |                                     *  *  *  (orbiting)
  |  Here is the response
  |  that just appeared              H e r e   i s   t h e
  |  all at once.                    response, appearing
  |                                  w o r d   b y   w o r d
  |  [Copy]                          with a soft blur-in.

                                      [Thought for 12s]  [Copy]
```

---

## Quick Install

```bash
# One component at a time (shadcn CLI)
npx shadcn@latest add https://uiforai.dev/r/streaming-text.json

# Or just copy the file from registry/ui/streaming-text.tsx into your project
```

**Requirements:** React 19 + TypeScript + Tailwind CSS v4 + Motion (Framer Motion) v12

---

## All Components at a Glance

```
ui-for-ai/
|
|-- STREAMING & TEXT -------- The core of any AI interface
|   |-- StreamingText          Token-by-token text reveal (4 modes)
|   |-- ThinkingIndicator      7-state AI indicator (NOT bouncing dots)
|   |-- ReasoningTrace         Collapsible chain-of-thought
|   |-- StreamingMarkdown      Handles incomplete markdown during streaming
|
|-- AGENT WORKFLOWS --------- Visualize multi-step AI agents
|   |-- AgentNode              React Flow node with status animations
|   |-- DataEdge               Animated edge with flowing particles
|   |-- AgentTimeline          Vertical step timeline with live progress
|   |-- ToolCallCard           Tool invocation with expanding results
|
|-- LAYOUT & TRANSITIONS ---- Smooth state changes
|   |-- AnimatedTabs           Sliding indicator + content cross-fade
|   |-- StreamingLayout        Container that grows smoothly with content
|   |-- MorphContainer         Chat <-> Canvas <-> Code transitions
|   |-- ArtifactPane           Split-pane with drag-to-resize
|
|-- AMBIENT & BACKGROUND ---- The premium feel
|   |-- AIGlow                 Ambient glow responding to AI state
|   |-- GridBackground         Dots/grid/cross pattern (pure CSS, 0 JS)
|   |-- ParticleField          Interactive Canvas particle background
|
|-- DATA & FEEDBACK --------- Progress and metrics
|   |-- ProgressRing           Circular progress with spring physics
|   |-- TokenCounter           Animated token usage with color thresholds
|   |-- VoiceWaveform          Real-time audio waveform (Web Audio API)
|
|-- INTERACTIVE ------------- Small details that signal quality
|   |-- CopyButton             One-click copy with animated checkmark
|
|-- HOOKS ------------------- The foundation
    |-- useAIState             Type-safe state machine (7 AI states)
    |-- useStreamingBuffer     Decouples network jitter from visuals
    |-- useReducedMotion       SSR-safe reduced motion detection
    |-- useAnimatedNumber      Spring-animated number transitions
```

---

## Component Showcase

### 1. StreamingText

The hero component. Token-by-token text reveal that decouples network jitter from visual presentation.

```tsx
import { StreamingText } from "@/components/ui-for-ai/streaming-text";

// 4 animation modes
<StreamingText content={text} mode="fade" isStreaming />       // Soft fade-in
<StreamingText content={text} mode="blur-in" isStreaming />    // Blur to sharp
<StreamingText content={text} mode="slide-up" isStreaming />   // Spring slide
<StreamingText content={text} mode="typewriter" isStreaming /> // Character by character
```

**With Vercel AI SDK:**

```tsx
import { useChat } from "ai/react";
import { StreamingText } from "@/components/ui-for-ai/streaming-text";

function Chat() {
  const { messages, isLoading } = useChat();

  return messages.map((m) => (
    <StreamingText
      key={m.id}
      content={m.content}
      mode="blur-in"
      speed={50}
      isStreaming={m.role === "assistant" && isLoading}
      onComplete={() => console.log("Done streaming")}
    />
  ));
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | required | Text content (can be updated progressively) |
| `mode` | `"fade" \| "blur-in" \| "slide-up" \| "typewriter"` | `"fade"` | Animation mode |
| `speed` | `number` | `40` | Tokens per second for visual smoothing |
| `isStreaming` | `boolean` | `true` | Whether content is still arriving |
| `byCharacter` | `boolean` | `false` | Split by characters instead of words |
| `onComplete` | `() => void` | -- | Fires when streaming + buffer complete |

---

### 2. ThinkingIndicator

7-state AI indicator. Not three bouncing dots -- a state machine with distinct visuals for each phase.

```tsx
import { ThinkingIndicator } from "@/components/ui-for-ai/thinking-indicator";

<ThinkingIndicator state="idle" />          // Faded dot
<ThinkingIndicator state="thinking" />      // Pulsing orbs
<ThinkingIndicator state="deep-thinking" /> // Glowing, faster orbs
<ThinkingIndicator state="tool-calling" />  // Sequential flash
<ThinkingIndicator state="streaming" />     // Wave motion
<ThinkingIndicator state="complete" />      // Animated checkmark
<ThinkingIndicator state="error" />         // Red shake
```

```
State Machine:

  idle --> thinking --> deep-thinking
                  |
                  +--> tool-calling --> streaming --> complete
                                                |
                                                +--> error
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `state` | `AIState` | required | One of 7 semantic states |
| `labels` | `Partial<Record<AIState, string>>` | built-in | Override labels per state |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size variant |

---

### 3. ReasoningTrace

Collapsible chain-of-thought display. Auto-opens during streaming, auto-collapses when done.

```tsx
import { ReasoningTrace } from "@/components/ui-for-ai/reasoning-trace";

<ReasoningTrace
  content="Let me analyze the data... First, I'll check the API response format..."
  isStreaming={isThinking}
  durationSeconds={12}
/>
```

```
[Collapsed]   > Thought for 12s
[Expanded]    v Thinking...
                Let me analyze the data...
                First, I'll check the API response format...
                The key insight is that... |  <-- blinking cursor
```

---

### 4. StreamingMarkdown

Renders markdown that's still being written. Handles unclosed code blocks, partial lists, incomplete bold -- without visual glitches.

```tsx
import { StreamingMarkdown } from "@/components/ui-for-ai/streaming-markdown";

<StreamingMarkdown
  content={partialMarkdown}
  isStreaming={true}
/>
```

Unclosed code blocks show a blinking cursor. New blocks animate in with spring entrance.

---

### 5. AgentNode + DataEdge

React Flow integration for visualizing agent workflows.

```tsx
import { AgentNode } from "@/components/ui-for-ai/agent-node";
import { DataEdge } from "@/components/ui-for-ai/data-edge";

// Use as custom node in React Flow
const nodeTypes = {
  agent: (props) => <AgentNode {...props.data} />,
};

// AgentNode status animations:
<AgentNode label="Fetch Data" status="idle" />     // Static, muted
<AgentNode label="Fetch Data" status="waiting" />  // Border pulse
<AgentNode label="Fetch Data" status="running" />  // Ripple rings
<AgentNode label="Fetch Data" status="success" />  // Checkmark draw
<AgentNode label="Fetch Data" status="error" />    // Red shake
```

```
  [Fetch Data]  ~~particles~~>  [Process]  ~~particles~~>  [Respond]
     (idle)                     (running)                  (waiting)
                                 *  *  *
                              ripple rings
```

---

### 6. AgentTimeline

Vertical step timeline showing agent execution progress in real-time.

```tsx
import { AgentTimeline } from "@/components/ui-for-ai/agent-timeline";

<AgentTimeline
  steps={[
    { id: "1", title: "Parse user query", status: "complete" },
    { id: "2", title: "Search knowledge base", status: "complete" },
    { id: "3", title: "Generate response", status: "running",
      description: "Using gpt-4o with RAG context..." },
    { id: "4", title: "Validate output", status: "pending" },
  ]}
/>
```

```
  * Parse user query            <-- green checkmark
  |
  * Search knowledge base       <-- green checkmark
  |
  * Generate response           <-- pulsing blue dot
  | Using gpt-4o with RAG...
  |
  o Validate output             <-- hollow pending
```

---

### 7. ToolCallCard

Shows a tool invocation with animated expansion to reveal results.

```tsx
import { ToolCallCard } from "@/components/ui-for-ai/tool-call-card";

<ToolCallCard
  toolName="search_database"
  args={{ query: "recent orders", limit: 10 }}
  status="running"
/>

// When complete, expands to show result:
<ToolCallCard
  toolName="search_database"
  args={{ query: "recent orders", limit: 10 }}
  result={<pre>{JSON.stringify(data, null, 2)}</pre>}
  status="complete"
/>
```

```
  +------------------------------------------+
  | search_database              [spinning]   |
  | query: "recent orders", limit: 10         |
  +------------------------------------------+
                    |
                    v (spring expand)
  +------------------------------------------+
  | search_database                    [ok]   |
  | query: "recent orders", limit: 10         |
  |------------------------------------------|
  | { "results": [...], "count": 10 }        |
  +------------------------------------------+
```

---

### 8. Layout Components

#### AnimatedTabs

```tsx
import { AnimatedTabs } from "@/components/ui-for-ai/animated-tabs";

<AnimatedTabs
  tabs={[
    { id: "response", label: "Response" },
    { id: "code", label: "Code" },
    { id: "preview", label: "Preview" },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
>
  {activeTab === "response" && <ResponseView />}
  {activeTab === "code" && <CodeView />}
  {activeTab === "preview" && <PreviewView />}
</AnimatedTabs>
```

#### StreamingLayout

```tsx
import { StreamingLayout } from "@/components/ui-for-ai/streaming-layout";

// Container height animates smoothly as content streams in
<StreamingLayout spring={{ stiffness: 200, damping: 25 }}>
  <StreamingText content={text} isStreaming />
</StreamingLayout>
```

#### MorphContainer

```tsx
import { MorphContainer } from "@/components/ui-for-ai/morph-container";

// Smooth transitions between fundamentally different views
<MorphContainer activeView={currentView} transition="scale">
  {currentView === "chat" && <ChatView />}
  {currentView === "canvas" && <CanvasView />}
  {currentView === "code" && <CodeView />}
</MorphContainer>
```

#### ArtifactPane

```tsx
import { ArtifactPane } from "@/components/ui-for-ai/artifact-pane";

// Split-pane like Claude Artifacts
<ArtifactPane
  open={showArtifact}
  onOpenChange={setShowArtifact}
  contentType="code"
  artifact={<CodePreview code={generatedCode} />}
>
  <ChatMessages />
</ArtifactPane>
```

---

### 9. Ambient & Background

#### AIGlow

```tsx
import { AIGlow } from "@/components/ui-for-ai/ai-glow";

// Wrap any element -- glow responds to AI state
<AIGlow state="thinking" color="oklch(0.6 0.18 250)">
  <ChatContainer />
</AIGlow>
```

```
  State:       Visual:
  idle         Barely visible, static
  thinking     Gentle blue pulse
  deep-think   Intense glow, wider
  tool-call    Quick pulse
  streaming    Flowing gradient
  complete     Settles to soft
  error        Red shift
```

#### GridBackground

```tsx
import { GridBackground } from "@/components/ui-for-ai/grid-background";

<GridBackground variant="dots" fade fadeDirection="center">
  <YourContent />
</GridBackground>

// Variants: "dots" | "grid" | "cross"
// Pure CSS -- zero JavaScript runtime cost
```

#### ParticleField

```tsx
import { ParticleField } from "@/components/ui-for-ai/particle-field";

<ParticleField
  count={60}
  interactive
  connectionDistance={120}
  speed={1}
  style={{ width: "100%", height: 400 }}
>
  <HeroContent />
</ParticleField>
```

---

### 10. Data & Feedback

#### ProgressRing

```tsx
import { ProgressRing } from "@/components/ui-for-ai/progress-ring";

<ProgressRing progress={65} currentStep={3} totalSteps={5} size={64} />
```

#### TokenCounter

```tsx
import { TokenCounter } from "@/components/ui-for-ai/token-counter";

// Full variant with bar
<TokenCounter value={3847} max={4096} label="tokens" warningThreshold={0.8} />

// Compact variant (inline)
<TokenCounter value={3847} max={4096} variant="compact" />
```

```
  Full:     3,847 / 4,096 tokens
            [========== 94% =========]  <-- red (over threshold)

  Compact:  3,847 / 4,096 tokens
```

#### VoiceWaveform

```tsx
import { VoiceWaveform } from "@/components/ui-for-ai/voice-waveform";

// Pass a MediaStream from getUserMedia
<VoiceWaveform stream={audioStream} active={isRecording} barCount={32} />
```

#### CopyButton

```tsx
import { CopyButton } from "@/components/ui-for-ai/copy-button";

<CopyButton value="const x = 42;" />
// Click: clipboard icon -> animated checkmark -> clipboard icon
```

---

## Hooks

### useAIState

Type-safe state machine for the AI processing lifecycle.

```tsx
import { useAIState } from "@/hooks/use-ai-state";

function MyComponent() {
  const { state, setState, isProcessing, isIdle } = useAIState({
    resetDelay: 3000, // Auto-reset to idle after complete
  });

  // setState("thinking") -> setState("streaming") -> setState("complete")
  // isProcessing is true for: thinking, deep-thinking, tool-calling, streaming

  return <ThinkingIndicator state={state} />;
}
```

### useStreamingBuffer

The secret sauce. Decouples network jitter from visual presentation.

```tsx
import { useStreamingBuffer } from "@/hooks/use-streaming-buffer";

function MyStreamingComponent({ rawContent }: { rawContent: string }) {
  const { displayedTokens, push, isBuffering, displayedText } =
    useStreamingBuffer({ tokensPerSecond: 40 });

  useEffect(() => push(rawContent), [rawContent]);

  // displayedTokens drains at a steady 40 tokens/sec
  // Network bursts are smoothed. Pauses feel natural.
  return <p>{displayedText}</p>;
}
```

```
Network:    [burst].........[burst]...[burst][burst][burst]
Visual:     word  word  word  word  word  word  word  word
            ^-- steady, smooth, no jitter --^
```

### useAnimatedNumber

Spring-animated number transitions for counters and metrics.

```tsx
import { useAnimatedNumber } from "@/hooks/use-animated-number";

function TokenDisplay({ count }: { count: number }) {
  const { displayValue } = useAnimatedNumber(count, {
    stiffness: 100,
    damping: 20,
    precision: 0,
  });

  return <span>{displayValue}</span>; // Smoothly counts up/down
}
```

---

## When to Use What

```
"I need to show streaming AI text"
  --> StreamingText (mode="blur-in" for chat, "typewriter" for code)
  --> StreamingMarkdown (if content is markdown)
  --> StreamingLayout (wrap it for smooth height changes)

"I need to show the AI is processing"
  --> ThinkingIndicator (7 states: thinking, tool-calling, etc.)
  --> AIGlow (ambient background effect)

"I need to show AI reasoning/thinking"
  --> ReasoningTrace (collapsible, auto-open/close)

"I need to visualize an agent workflow"
  --> AgentNode + DataEdge (with React Flow)
  --> AgentTimeline (vertical step list)
  --> ToolCallCard (individual tool invocations)

"I need to switch between AI output views"
  --> AnimatedTabs (text / code / preview tabs)
  --> MorphContainer (full view transitions)
  --> ArtifactPane (side-by-side like Claude Artifacts)

"I need a premium background"
  --> GridBackground (lightweight, pure CSS)
  --> ParticleField (interactive, Canvas-based)
  --> AIGlow (ambient state-aware glow)

"I need to show progress/metrics"
  --> ProgressRing (multi-step agent progress)
  --> TokenCounter (token usage with thresholds)
  --> useAnimatedNumber (any animated number)

"I need audio/voice UI"
  --> VoiceWaveform (real-time frequency bars)
```

---

## Architecture

```
  Your App
    |
    |-- components/ui-for-ai/    <-- copied files live here
    |     |-- streaming-text.tsx
    |     |-- thinking-indicator.tsx
    |     |-- ...
    |
    |-- hooks/
          |-- use-ai-state.ts
          |-- use-streaming-buffer.ts
          |-- use-reduced-motion.ts
          |-- use-animated-number.ts
```

### Dependency Graph

```
                        use-reduced-motion
                       /        |          \
                      /         |           \
  StreamingText  ThinkingInd  AIGlow  ... (all components)
       |              |         |
  use-streaming    use-ai     use-ai
  -buffer          -state     -state
```

Only 2 external dependencies:
- `motion` ^12 -- 16 of 19 components (GPU-accelerated, WAAPI-backed)
- `@xyflow/react` ^12 -- AgentNode + DataEdge only (optional)

---

## Performance

Every animation is designed for 120fps:

| Tier | Properties Used | Components |
|------|----------------|------------|
| **S** (compositor) | `transform`, `opacity` | StreamingText, ThinkingIndicator, CopyButton, AnimatedTabs, MorphContainer, AgentNode, ProgressRing |
| **A** (paint only) | `filter: blur`, `clip-path` | AIGlow, StreamingMarkdown, ToolCallCard |
| **B** (limited layout) | `height: auto` | ReasoningTrace, StreamingLayout, ArtifactPane |
| **Canvas** (GPU layer) | Canvas 2D | ParticleField, VoiceWaveform, DataEdge |

All components respect `prefers-reduced-motion`:
- Animations are disabled or simplified
- Information is always conveyed via text, not just animation
- Every interactive component is keyboard accessible

---

## Full Example: AI Chat Interface

```tsx
import { useState } from "react";
import { useChat } from "ai/react";
import { useAIState } from "@/hooks/use-ai-state";
import { StreamingText } from "@/components/ui-for-ai/streaming-text";
import { ThinkingIndicator } from "@/components/ui-for-ai/thinking-indicator";
import { ReasoningTrace } from "@/components/ui-for-ai/reasoning-trace";
import { ToolCallCard } from "@/components/ui-for-ai/tool-call-card";
import { AIGlow } from "@/components/ui-for-ai/ai-glow";
import { GridBackground } from "@/components/ui-for-ai/grid-background";
import { CopyButton } from "@/components/ui-for-ai/copy-button";

function AIChatInterface() {
  const { state, setState } = useAIState();
  const { messages, isLoading } = useChat({
    onResponse: () => setState("streaming"),
    onFinish: () => setState("complete"),
  });

  return (
    <GridBackground variant="dots" fade>
      <AIGlow state={state}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
          <ThinkingIndicator state={state} />

          {messages.map((m) => (
            <div key={m.id} style={{ marginBottom: 16 }}>
              {m.toolInvocations?.map((tool) => (
                <ToolCallCard
                  key={tool.toolCallId}
                  toolName={tool.toolName}
                  args={tool.args}
                  result={tool.result}
                  status={tool.state === "result" ? "complete" : "running"}
                />
              ))}

              <StreamingText
                content={m.content}
                mode="blur-in"
                isStreaming={m.role === "assistant" && isLoading}
              />

              <CopyButton value={m.content} />
            </div>
          ))}
        </div>
      </AIGlow>
    </GridBackground>
  );
}
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

Every component is a single `.tsx` file in `registry/ui/`. Hooks are in `registry/hooks/`.

```bash
git clone https://github.com/your-username/ui-for-ai.git
cd ui-for-ai
pnpm install
pnpm typecheck  # Must pass with zero errors
pnpm lint       # Must pass with zero errors
```

## License

[MIT](./LICENSE) -- Use it however you want.

---

<p align="center">
  <strong>Built for the humans building AI.</strong><br/>
  Agents don't need UI. You do.
</p>
