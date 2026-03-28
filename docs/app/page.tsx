"use client";

import { useState, useEffect } from "react";
import { StreamingText } from "@/components/ui-for-ai/streaming-text";
import { ThinkingIndicator } from "@/components/ui-for-ai/thinking-indicator";
import { ReasoningTrace } from "@/components/ui-for-ai/reasoning-trace";
import { StreamingMarkdown } from "@/components/ui-for-ai/streaming-markdown";
import { CopyButton } from "@/components/ui-for-ai/copy-button";
import { AIGlow } from "@/components/ui-for-ai/ai-glow";
import { GridBackground } from "@/components/ui-for-ai/grid-background";
import { AnimatedTabs } from "@/components/ui-for-ai/animated-tabs";
import { AgentNode } from "@/components/ui-for-ai/agent-node";
import { AgentTimeline } from "@/components/ui-for-ai/agent-timeline";
import { ToolCallCard } from "@/components/ui-for-ai/tool-call-card";
import { ProgressRing } from "@/components/ui-for-ai/progress-ring";
import { TokenCounter } from "@/components/ui-for-ai/token-counter";
import { ParticleField } from "@/components/ui-for-ai/particle-field";
import type { AIState } from "@/hooks/use-ai-state";
import type { AgentStatus } from "@/components/ui-for-ai/agent-node";

const DEMO_TEXT =
  "The architecture uses a multi-agent pipeline where each agent specializes in a specific task. The orchestrator routes requests based on intent classification, then aggregates results through a consensus mechanism.";

const DEMO_MARKDOWN = `## Analysis Complete

The data reveals **three key insights**:

1. Revenue grew **34%** quarter-over-quarter
2. User retention improved after the redesign
3. API latency dropped below \`50ms\` at p99

\`\`\`python
def analyze(data):
    trends = detect_trends(data)
    return trends.summary()
\`\`\`

> The most significant finding is the correlation between onboarding and retention.`;

function useSimulatedStream(text: string, speed = 12) {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    let i = 0;
    setContent("");
    setIsStreaming(true);
    const words = text.split(" ");

    const interval = setInterval(() => {
      if (i < words.length) {
        setContent(words.slice(0, i + 1).join(" "));
        i++;
      } else {
        setIsStreaming(false);
        clearInterval(interval);
        setTimeout(() => { i = 0; setContent(""); setIsStreaming(true); }, 4000);
      }
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { content, isStreaming };
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="mb-20">
      <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
      <p className="text-xs text-neutral-500 mb-6">{sub}</p>
      {children}
    </section>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="text-[10px] font-mono text-neutral-600 mb-3 uppercase tracking-wider">{label}</div>
      {children}
    </div>
  );
}

export default function Home() {
  // Streaming demos
  const fade = useSimulatedStream(DEMO_TEXT, 10);
  const blur = useSimulatedStream(DEMO_TEXT, 10);
  const slide = useSimulatedStream(DEMO_TEXT, 10);
  const md = useSimulatedStream(DEMO_MARKDOWN, 6);

  // Thinking indicator state cycling
  const [thinkIdx, setThinkIdx] = useState(0);
  const thinkStates: AIState[] = ["thinking", "deep-thinking", "tool-calling", "streaming", "complete", "error"];
  useEffect(() => { const t = setInterval(() => setThinkIdx((i) => (i + 1) % thinkStates.length), 2200); return () => clearInterval(t); }, [thinkStates.length]);

  // Reasoning trace
  const reasoning = useSimulatedStream(
    "Let me analyze this step by step. First, I need to check the database schema. The users table has a foreign key to organizations. The query needs to join three tables and filter by date range. I should use a CTE for clarity. The key insight is aggregating at the project level first.",
    8,
  );

  // Agent workflow
  const [agentStep, setAgentStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setAgentStep((s) => (s + 1) % 4), 2500); return () => clearInterval(t); }, []);
  const nodeMap: Record<number, { p: AgentStatus; s: AgentStatus; g: AgentStatus }> = {
    0: { p: "running", s: "idle", g: "idle" },
    1: { p: "success", s: "running", g: "idle" },
    2: { p: "success", s: "success", g: "running" },
    3: { p: "success", s: "success", g: "success" },
  };
  const ns = nodeMap[agentStep] ?? nodeMap[0]!;

  // Tool call
  const [toolStatus, setToolStatus] = useState<"calling" | "running" | "complete">("calling");
  useEffect(() => {
    const seq: Array<"calling" | "running" | "complete"> = ["calling", "running", "complete"];
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % seq.length; setToolStatus(seq[i]!); }, 2000);
    return () => clearInterval(t);
  }, []);

  // Glow state
  const [glowState, setGlowState] = useState<AIState>("thinking");

  // Tabs
  const [activeTab, setActiveTab] = useState("response");

  // Data
  const [progress, setProgress] = useState(0);
  const [tokens, setTokens] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 1.5));
      setTokens((t) => (t >= 4096 ? 500 : t + Math.floor(Math.random() * 50) + 10));
    }, 120);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ minHeight: 480 }}>
        <GridBackground variant="dots" fade fadeDirection="center">
          <div className="absolute inset-0">
            <ParticleField count={35} color="rgba(100, 140, 255, 0.2)" connectionDistance={100} speed={0.4} className="w-full h-full" />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
            <span className="text-[10px] font-mono text-neutral-500 border border-neutral-800 rounded-full px-3 py-1 mb-6 uppercase tracking-widest">
              19 components &middot; 4 hooks &middot; shadcn-compatible
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-3">ui-for-ai</h1>
            <p className="text-lg text-neutral-400 mb-2">Make AI interfaces feel alive.</p>
            <p className="text-sm text-neutral-600 max-w-md mb-8">
              Drop-in animated components for streaming, thinking, agent workflows, and every AI state.
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <a href="https://github.com/AashishNandakumar/ui-for-ai" className="px-5 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-neutral-200 transition-colors">
                GitHub
              </a>
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2">
                <code className="text-[11px] text-neutral-400 font-mono">npx shadcn add streaming-text</code>
                <CopyButton value="npx shadcn@latest add https://uiforai.dev/r/streaming-text.json" />
              </div>
            </div>
          </div>
        </GridBackground>
      </div>

      {/* Components */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Streaming Text */}
        <Section title="Streaming Text" sub="Token-by-token reveal with 4 animation modes. Buffer decouples network jitter from visuals.">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card label="fade">
              <StreamingText content={fade.content} mode="fade" isStreaming={fade.isStreaming} className="text-sm text-neutral-300 leading-relaxed" />
            </Card>
            <Card label="blur-in">
              <StreamingText content={blur.content} mode="blur-in" isStreaming={blur.isStreaming} className="text-sm text-neutral-300 leading-relaxed" />
            </Card>
            <Card label="slide-up">
              <StreamingText content={slide.content} mode="slide-up" isStreaming={slide.isStreaming} className="text-sm text-neutral-300 leading-relaxed" />
            </Card>
          </div>
        </Section>

        {/* Thinking Indicator */}
        <Section title="Thinking Indicator" sub="7 semantic states. Not bouncing dots.">
          <Card label="Click to change state">
            <div className="flex items-center gap-6 py-3 mb-4">
              <ThinkingIndicator state={thinkStates[thinkIdx]!} size="lg" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {thinkStates.map((s, i) => (
                <button key={s} onClick={() => setThinkIdx(i)} className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${s === thinkStates[thinkIdx] ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-neutral-900 text-neutral-600 border border-neutral-800 hover:border-neutral-700"}`}>
                  {s}
                </button>
              ))}
            </div>
          </Card>
        </Section>

        {/* Reasoning Trace */}
        <Section title="Reasoning Trace" sub="Collapsible chain-of-thought. Auto-opens during streaming, auto-collapses when done.">
          <Card label="Live streaming reasoning">
            <ReasoningTrace content={reasoning.content} isStreaming={reasoning.isStreaming} durationSeconds={reasoning.isStreaming ? undefined : 8} />
          </Card>
        </Section>

        {/* Streaming Markdown */}
        <Section title="Streaming Markdown" sub="Renders incomplete markdown without glitches. Unclosed code blocks show a cursor.">
          <Card label="Markdown with code blocks streaming">
            <StreamingMarkdown content={md.content} isStreaming={md.isStreaming} className="text-sm text-neutral-300" />
          </Card>
        </Section>

        {/* Agent Workflow */}
        <Section title="Agent Workflow" sub="React Flow-compatible nodes with status animations. Timeline shows live execution.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card label="AgentNode">
              <div className="flex flex-col gap-3 py-1">
                <AgentNode label="Parse Query" status={ns.p} icon="Q" />
                <AgentNode label="Search KB" subtitle="vector search" status={ns.s} icon="S" />
                <AgentNode label="Generate" status={ns.g} icon="G" />
              </div>
            </Card>
            <Card label="AgentTimeline">
              <AgentTimeline steps={[
                { id: "1", title: "Parse user query", status: agentStep >= 1 ? "complete" : "running" },
                { id: "2", title: "Search knowledge base", status: agentStep >= 2 ? "complete" : agentStep === 1 ? "running" : "pending" },
                { id: "3", title: "Generate response", status: agentStep >= 3 ? "complete" : agentStep === 2 ? "running" : "pending" },
                { id: "4", title: "Validate output", status: agentStep >= 3 ? "complete" : "pending" },
              ]} />
            </Card>
          </div>
        </Section>

        {/* Tool Call */}
        <Section title="Tool Call Card" sub="Tool invocations with expanding results. Shimmer while running, spring expand on complete.">
          <div className="max-w-md">
            <ToolCallCard toolName="search_database" icon="DB" args={{ query: "recent orders", limit: 10 }} status={toolStatus} result={toolStatus === "complete" ? <pre className="text-[11px] font-mono text-neutral-400">{JSON.stringify({ results: [{ id: 1, item: "Widget A" }], count: 1 }, null, 2)}</pre> : undefined} />
          </div>
        </Section>

        {/* AI Glow */}
        <Section title="AI Glow" sub="Ambient glow responding to AI state. Thinking pulses, error shifts red.">
          <Card label="Click states to change glow">
            <div className="relative rounded-lg overflow-hidden" style={{ height: 160 }}>
              <AIGlow state={glowState} intensity={0.7}>
                <div className="flex items-center justify-center h-full">
                  <span className="text-neutral-500 text-sm font-mono">&quot;{glowState}&quot;</span>
                </div>
              </AIGlow>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(["idle", "thinking", "deep-thinking", "streaming", "complete", "error"] as AIState[]).map((s) => (
                <button key={s} onClick={() => setGlowState(s)} className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${s === glowState ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-neutral-900 text-neutral-600 border border-neutral-800 hover:border-neutral-700"}`}>
                  {s}
                </button>
              ))}
            </div>
          </Card>
        </Section>

        {/* Animated Tabs */}
        <Section title="Animated Tabs" sub="Sliding indicator with content cross-fade. Perfect for AI output modes.">
          <Card label="AnimatedTabs">
            <AnimatedTabs tabs={[{ id: "response", label: "Response" }, { id: "code", label: "Code" }, { id: "preview", label: "Preview" }]} activeTab={activeTab} onTabChange={setActiveTab}>
              <div className="p-4 text-sm text-neutral-400 min-h-[60px]">
                {activeTab === "response" && "The AI response with streaming text would appear here..."}
                {activeTab === "code" && <pre className="font-mono text-xs text-green-400">{"function hello() {\n  return 'world';\n}"}</pre>}
                {activeTab === "preview" && "Live preview of the generated component."}
              </div>
            </AnimatedTabs>
          </Card>
        </Section>

        {/* Data */}
        <Section title="Data & Feedback" sub="Progress rings and token counters with spring-animated numbers.">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card label="ProgressRing">
              <div className="flex justify-center py-4">
                <ProgressRing progress={Math.min(progress, 100)} currentStep={Math.ceil(Math.min(progress, 100) / 20)} totalSteps={5} size={72} strokeWidth={5} />
              </div>
            </Card>
            <Card label="TokenCounter">
              <div className="py-4">
                <TokenCounter value={Math.min(tokens, 4096)} max={4096} label="tokens" />
              </div>
            </Card>
            <Card label="CopyButton">
              <div className="flex items-center gap-3 py-4">
                <code className="text-[10px] text-neutral-500 bg-neutral-900 px-2 py-1.5 rounded font-mono truncate">npx shadcn add streaming-text</code>
                <CopyButton value="npx shadcn@latest add https://uiforai.dev/r/streaming-text.json" />
              </div>
            </Card>
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-16 text-center border-t border-neutral-900 pt-10 pb-6">
          <p className="text-neutral-500 text-sm mb-1">Built for the humans building AI.</p>
          <p className="text-neutral-700 text-xs">Agents don&apos;t need UI. You do.</p>
        </div>
      </div>
    </div>
  );
}
