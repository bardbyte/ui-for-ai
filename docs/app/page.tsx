"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
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
import { EmptyState } from "@/components/ui-for-ai/empty-state";
import { ErrorState } from "@/components/ui-for-ai/error-state";
import { SkeletonBlock } from "@/components/ui-for-ai/skeleton-block";
import { CitationCard } from "@/components/ui-for-ai/citation-card";
import { MessageBranch } from "@/components/ui-for-ai/message-branch";
import { ApprovalCard } from "@/components/ui-for-ai/approval-card";
import { CodeArtifact } from "@/components/ui-for-ai/code-artifact";
import type { AIState } from "@/hooks/use-ai-state";
import type { AgentStatus } from "@/components/ui-for-ai/agent-node";

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

const DEMO_TEXT =
  "The architecture uses a multi-agent pipeline where each agent specializes in a specific task. The orchestrator routes requests based on intent classification, then aggregates results through a consensus mechanism that weighs confidence scores.";

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

> The most significant finding is the correlation between onboarding completion and 90-day retention.`;

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

// ---------------------------------------------------------------------------
// Layout primitives — glassmorphic, scroll-revealed
// ---------------------------------------------------------------------------

function Section({ title, sub, children, delay = 0 }: { title: string; sub: string; children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px", amount: 0.1 });
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Before hydration, render visible. After hydration, animate.
  const shouldAnimate = hasMounted;

  return (
    <motion.section
      ref={ref}
      initial={shouldAnimate ? { opacity: 0, y: 30, filter: "blur(4px)" } : false}
      animate={!shouldAnimate || inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="mb-28"
    >
      <div className="mb-6">
        <h2 className="text-[22px] font-semibold tracking-[-0.02em]" style={{ color: "oklch(0.93 0.005 260)" }}>
          {title}
        </h2>
        <p className="text-[13px] mt-1" style={{ color: "oklch(0.45 0.01 260)" }}>{sub}</p>
      </div>
      {children}
    </motion.section>
  );
}

function GlassCard({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        borderRadius: 16,
        padding: "20px 20px 24px",
        background: "linear-gradient(135deg, oklch(0.14 0.008 260 / 0.9), oklch(0.10 0.005 260 / 0.8))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid oklch(0.22 0.01 260 / 0.4)",
        boxShadow: [
          "inset 0 1px 0 oklch(1.0 0 0 / 0.04)",
          "inset 0 -1px 0 oklch(0 0 0 / 0.15)",
          "0 2px 4px oklch(0 0 0 / 0.2)",
          "0 8px 24px oklch(0 0 0 / 0.15)",
        ].join(", "),
      }}
    >
      <div
        className="mb-4 uppercase tracking-[0.12em] font-medium"
        style={{ fontSize: 10, color: "oklch(0.40 0.02 260)" }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function StateButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="transition-all duration-200"
      style={{
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 10,
        fontFamily: "var(--font-geist-mono), monospace",
        border: `1px solid ${active ? "oklch(0.72 0.14 250 / 0.3)" : "oklch(0.20 0.01 260 / 0.5)"}`,
        background: active ? "oklch(0.72 0.14 250 / 0.1)" : "oklch(0.10 0.005 260 / 0.5)",
        color: active ? "oklch(0.78 0.12 250)" : "oklch(0.45 0.01 260)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section demos
// ---------------------------------------------------------------------------

function StreamingShowcase() {
  const luminous = useSimulatedStream(DEMO_TEXT, 10);
  const blur = useSimulatedStream(DEMO_TEXT, 10);
  const slide = useSimulatedStream(DEMO_TEXT, 10);

  return (
    <Section title="Streaming Text" sub="Text materializes from light. A glowing wavefront travels with the stream. 4 modes.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard label="luminous (default)">
          <StreamingText content={luminous.content} mode="luminous" isStreaming={luminous.isStreaming} className="text-[14px] leading-[1.75]" />
        </GlassCard>
        <GlassCard label="blur-in">
          <StreamingText content={blur.content} mode="blur-in" isStreaming={blur.isStreaming} className="text-[14px] leading-[1.75]"  />
        </GlassCard>
        <GlassCard label="slide-up">
          <StreamingText content={slide.content} mode="slide-up" isStreaming={slide.isStreaming} className="text-[14px] leading-[1.75]"  />
        </GlassCard>
      </div>
    </Section>
  );
}

function ThinkingShowcase() {
  const [idx, setIdx] = useState(0);
  const states: AIState[] = ["thinking", "deep-thinking", "tool-calling", "streaming", "complete", "error"];
  useEffect(() => { const t = setInterval(() => setIdx((i) => (i + 1) % states.length), 2500); return () => clearInterval(t); }, [states.length]);

  return (
    <Section title="Thinking Indicator" sub="A glassmorphic orb with rotating inner layers. Not three bouncing dots." delay={0.05}>
      <GlassCard label="Click any state — or watch it cycle">
        <div className="flex items-center justify-center py-6">
          <ThinkingIndicator state={states[idx]!} size="lg" />
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {states.map((s, i) => (
            <StateButton key={s} label={s} active={s === states[idx]} onClick={() => setIdx(i)} />
          ))}
        </div>
      </GlassCard>
    </Section>
  );
}

function ReasoningShowcase() {
  const stream = useSimulatedStream(
    "Let me analyze step by step. First, I need to check the database schema. The users table has a foreign key to organizations. The query needs to join three tables, filter by date range, and use a CTE for clarity. The key insight is aggregating at the project level first, then rolling up.",
    8,
  );
  return (
    <Section title="Reasoning Trace" sub="Collapsible chain-of-thought. Auto-opens during streaming, auto-collapses when done." delay={0.05}>
      <GlassCard label="Live streaming reasoning">
        <ReasoningTrace content={stream.content} isStreaming={stream.isStreaming} durationSeconds={stream.isStreaming ? undefined : 8} />
      </GlassCard>
    </Section>
  );
}

function MarkdownShowcase() {
  const md = useSimulatedStream(DEMO_MARKDOWN, 6);
  return (
    <Section title="Streaming Markdown" sub="Renders incomplete markdown without glitches. Unclosed code blocks show a blinking cursor." delay={0.05}>
      <GlassCard label="Markdown with code blocks streaming in">
        <StreamingMarkdown content={md.content} isStreaming={md.isStreaming} className="text-[14px]"  />
      </GlassCard>
    </Section>
  );
}

function AgentShowcase() {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep((s) => (s + 1) % 4), 2500); return () => clearInterval(t); }, []);
  const m: Record<number, { p: AgentStatus; s: AgentStatus; g: AgentStatus }> = {
    0: { p: "running", s: "idle", g: "idle" },
    1: { p: "success", s: "running", g: "idle" },
    2: { p: "success", s: "success", g: "running" },
    3: { p: "success", s: "success", g: "success" },
  };
  const ns = m[step] ?? m[0]!;

  return (
    <Section title="Agent Workflow" sub="Glassmorphic nodes with rotating conic borders, edge-bleed glow, and live timeline." delay={0.05}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard label="AgentNode — hover for shine sweep">
          <div className="flex flex-col gap-4 py-2">
            <AgentNode label="Parse Query" status={ns.p} icon="Q" />
            <AgentNode label="Search KB" subtitle="vector search" status={ns.s} icon="S" />
            <AgentNode label="Generate" status={ns.g} icon="G" />
          </div>
        </GlassCard>
        <GlassCard label="AgentTimeline">
          <AgentTimeline steps={[
            { id: "1", title: "Parse user query", status: step >= 1 ? "complete" : "running" },
            { id: "2", title: "Search knowledge base", status: step >= 2 ? "complete" : step === 1 ? "running" : "pending" },
            { id: "3", title: "Generate response", status: step >= 3 ? "complete" : step === 2 ? "running" : "pending" },
            { id: "4", title: "Validate output", status: step >= 3 ? "complete" : "pending" },
          ]} />
        </GlassCard>
      </div>
    </Section>
  );
}

function ToolCallShowcase() {
  const [status, setStatus] = useState<"calling" | "running" | "complete">("calling");
  useEffect(() => {
    const seq: Array<"calling" | "running" | "complete"> = ["calling", "running", "complete"];
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % seq.length; setStatus(seq[i]!); }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <Section title="Tool Call Card" sub="Chromatic shimmer while running. Two-phase spring expansion reveals results." delay={0.05}>
      <div className="max-w-md">
        <ToolCallCard
          toolName="search_database"
          icon="DB"
          args={{ query: "recent orders", limit: 10 }}
          status={status}
          result={status === "complete" ? (
            <pre className="text-[11px] font-mono" style={{ color: "oklch(0.6 0.01 260)" }}>
              {JSON.stringify({ results: [{ id: 1, item: "Widget A" }, { id: 2, item: "Widget B" }], count: 2 }, null, 2)}
            </pre>
          ) : undefined}
        />
      </div>
    </Section>
  );
}

function GlowShowcase() {
  const [glowState, setGlowState] = useState<AIState>("thinking");
  return (
    <Section title="AI Glow" sub="Three independently-moving blobs with mix-blend-mode: screen. Noise texture overlay for organic feel." delay={0.05}>
      <GlassCard label="Click states to see the aurora shift">
        <div className="relative rounded-xl overflow-hidden" style={{ height: 200, background: "oklch(0.08 0.005 260)" }}>
          <AIGlow state={glowState} intensity={0.8}>
            <div className="flex items-center justify-center h-full">
              <span className="font-mono text-sm" style={{ color: "oklch(0.5 0.01 260)" }}>
                state: &quot;{glowState}&quot;
              </span>
            </div>
          </AIGlow>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {(["idle", "thinking", "deep-thinking", "streaming", "complete", "error"] as AIState[]).map((s) => (
            <StateButton key={s} label={s} active={s === glowState} onClick={() => setGlowState(s)} />
          ))}
        </div>
      </GlassCard>
    </Section>
  );
}

function TabsShowcase() {
  const [tab, setTab] = useState("response");
  return (
    <Section title="Animated Tabs" sub="Sliding indicator with spring physics. Content cross-fades on switch." delay={0.05}>
      <GlassCard label="AnimatedTabs">
        <AnimatedTabs
          tabs={[{ id: "response", label: "Response" }, { id: "code", label: "Code" }, { id: "preview", label: "Preview" }]}
          activeTab={tab}
          onTabChange={setTab}
        >
          <div className="p-5 text-[14px] min-h-[72px]" style={{ color: "oklch(0.65 0.01 260)" }}>
            {tab === "response" && "The AI response with streaming text would appear here, word by word..."}
            {tab === "code" && <pre className="font-mono text-xs" style={{ color: "oklch(0.72 0.16 155)" }}>{"function hello() {\n  return 'world';\n}"}</pre>}
            {tab === "preview" && "Live preview of the generated component renders here."}
          </div>
        </AnimatedTabs>
      </GlassCard>
    </Section>
  );
}

function DataShowcase() {
  const [progress, setProgress] = useState(0);
  const [tokens, setTokens] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 1.2));
      setTokens((v) => (v >= 4096 ? 400 : v + Math.floor(Math.random() * 40) + 10));
    }, 100);
    return () => clearInterval(t);
  }, []);

  return (
    <Section title="Data & Feedback" sub="Spring-animated numbers. Progress rings with smooth arc fill. Color-coded token thresholds." delay={0.05}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard label="ProgressRing">
          <div className="flex justify-center py-5">
            <ProgressRing progress={Math.min(progress, 100)} currentStep={Math.ceil(Math.min(progress, 100) / 20)} totalSteps={5} size={80} strokeWidth={5} />
          </div>
        </GlassCard>
        <GlassCard label="TokenCounter">
          <div className="py-5">
            <TokenCounter value={Math.min(tokens, 4096)} max={4096} label="tokens" />
          </div>
        </GlassCard>
        <GlassCard label="CopyButton">
          <div className="flex items-center gap-3 py-5">
            <code className="text-[10px] bg-black/30 px-3 py-2 rounded-lg font-mono truncate" style={{ color: "oklch(0.50 0.01 260)" }}>
              npx shadcn add streaming-text
            </code>
            <CopyButton value="npx shadcn@latest add https://uiforai.dev/r/streaming-text.json" />
          </div>
        </GlassCard>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Wave 2 Showcase Sections
// ---------------------------------------------------------------------------

function ApprovalShowcase() {
  const [resolved, setResolved] = useState<"approved" | "rejected" | undefined>(undefined);

  useEffect(() => {
    if (resolved) {
      const t = setTimeout(() => setResolved(undefined), 3000);
      return () => clearTimeout(t);
    }
  }, [resolved]);

  return (
    <Section title="Approval Card" sub="Human-in-the-loop. Agent proposes, user approves or rejects." delay={0.05}>
      <div className="max-w-lg">
        <ApprovalCard
          title="Delete 3 inactive user accounts"
          description="These accounts have not been accessed in 90+ days and have no active subscriptions."
          impact="medium"
          cost="Irreversible"
          resolved={resolved}
          onApprove={() => setResolved("approved")}
          onReject={() => setResolved("rejected")}
        >
          <div style={{ fontSize: 12, color: "oklch(0.55 0.01 260)", fontFamily: "var(--font-geist-mono, monospace)" }}>
            user_1042 (last active: 2025-12-01){"\n"}
            user_1089 (last active: 2025-11-15){"\n"}
            user_1103 (last active: 2025-10-28)
          </div>
        </ApprovalCard>
      </div>
    </Section>
  );
}

function CitationShowcase() {
  return (
    <Section title="Citation Card" sub="Inline [1] markers for RAG. Hover to see the retrieved source chunk with relevance score." delay={0.05}>
      <GlassCard label="Inline citations in AI response">
        <p className="text-[14px] leading-[1.75]" style={{ color: "oklch(0.82 0.005 260)" }}>
          The company reported strong Q3 earnings with revenue up 34%
          <CitationCard index={1} title="Q3 Earnings Report" source="investor-relations.pdf" content="Revenue increased 34% year-over-year to $2.1B, driven primarily by enterprise adoption of the AI platform." score={0.94} page="12" />
          {" "}driven by enterprise AI adoption. User retention improved significantly after the onboarding redesign
          <CitationCard index={2} title="Product Analytics Dashboard" source="analytics.internal" content="30-day retention improved from 62% to 78% following the March onboarding redesign. Key factor: reduced time-to-first-value from 8 minutes to 2.5 minutes." score={0.87} />
          {" "}with time-to-first-value dropping from 8 minutes to 2.5 minutes.
        </p>
      </GlassCard>
    </Section>
  );
}

function CodeArtifactShowcase() {
  const sampleCode = `import { StreamingText } from "@/components/ui-for-ai/streaming-text";
import { useChat } from "ai/react";

export function Chat() {
  const { messages, isLoading } = useChat();

  return (
    <div className="max-w-2xl mx-auto">
      {messages.map((m) => (
        <StreamingText
          key={m.id}
          content={m.content}
          mode="luminous"
          isStreaming={m.role === "assistant" && isLoading}
        />
      ))}
    </div>
  );
}`;

  return (
    <Section title="Code Artifact" sub="Claude Artifacts-style code preview. Line numbers, copy, download, code/preview toggle." delay={0.05}>
      <CodeArtifact
        code={sampleCode}
        language="typescript"
        filename="chat.tsx"
        preview={
          <div style={{ padding: 16, fontSize: 13, color: "oklch(0.4 0 0)" }}>
            Live preview of the chat component would render here.
          </div>
        }
      />
    </Section>
  );
}

function SkeletonShowcase() {
  return (
    <Section title="Skeleton Block" sub="AI-aware loading skeletons. 5 variants matching common AI content types." delay={0.05}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard label="message">
          <SkeletonBlock variant="message" lines={3} />
        </GlassCard>
        <GlassCard label="code">
          <SkeletonBlock variant="code" />
        </GlassCard>
        <GlassCard label="markdown">
          <SkeletonBlock variant="markdown" lines={3} />
        </GlassCard>
      </div>
    </Section>
  );
}

function EdgeStateShowcase() {
  const [variant, setVariant] = useState<"no-data" | "no-results" | "error" | "first-run" | "offline">("first-run");
  const [showError, setShowError] = useState(false);

  return (
    <Section title="Edge States" sub="The #2 vibe-coding complaint: missing loading, error, and empty states. Solved." delay={0.05}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard label="EmptyState — click variants">
          <EmptyState
            variant={variant}
            title={variant === "first-run" ? "Welcome to your AI workspace" : variant === "no-results" ? "No matching results" : variant === "no-data" ? "No conversations yet" : variant === "error" ? "Something went wrong" : "You're offline"}
            description={variant === "first-run" ? "Start a conversation to see your AI assistant in action." : "Try adjusting your search or filters."}
            action={{ label: variant === "first-run" ? "Start chatting" : "Try again", onClick: () => {} }}
          />
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {(["first-run", "no-data", "no-results", "error", "offline"] as const).map((v) => (
              <StateButton key={v} label={v} active={v === variant} onClick={() => setVariant(v)} />
            ))}
          </div>
        </GlassCard>
        <GlassCard label="ErrorState">
          <ErrorState
            variant="server"
            onRetry={() => { setShowError(true); setTimeout(() => setShowError(false), 2000); }}
            isRetrying={showError}
            details="Error: ECONNREFUSED 10.0.0.1:5432\n  at TCPConnectWrap.afterConnect\n  at PostgresClient.connect (pg.js:42:11)"
          />
        </GlassCard>
      </div>
    </Section>
  );
}

function MessageBranchShowcase() {
  const [branch, setBranch] = useState(1);
  const responses = [
    "The best approach is to use a recursive algorithm with memoization, which gives O(n) time complexity.",
    "I'd recommend an iterative dynamic programming solution. It uses O(1) space and is easier to debug.",
    "Consider using a mathematical closed-form solution. For Fibonacci specifically, Binet's formula gives O(1) time.",
  ];

  return (
    <Section title="Message Branch" sub="Response regeneration navigation. 'Show me another answer' with Previous/Next." delay={0.05}>
      <GlassCard label="Regenerated responses — navigate between them">
        <MessageBranch total={3} current={branch} onBranchChange={setBranch}>
          <p className="text-[14px] leading-[1.75] py-2" style={{ color: "oklch(0.82 0.005 260)" }}>
            {responses[branch - 1]}
          </p>
        </MessageBranch>
      </GlassCard>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <div className="min-h-screen selection:bg-blue-500/20" style={{ background: "oklch(0.06 0.005 260)", color: "oklch(0.93 0.005 260)" }}>

      {/* Fixed ambient gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="absolute"
          style={{
            top: "-20%", left: "-10%", width: "60%", height: "60%",
            background: "radial-gradient(ellipse, oklch(0.72 0.14 250 / 0.04), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-10%", right: "-15%", width: "50%", height: "50%",
            background: "radial-gradient(ellipse, oklch(0.65 0.20 280 / 0.03), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ minHeight: 520, zIndex: 1 }}>
        <GridBackground variant="dots" color="oklch(0.35 0.02 260 / 0.15)" fade fadeDirection="center">
          <div className="absolute inset-0">
            <ParticleField count={30} color="rgba(100, 140, 255, 0.15)" connectionDistance={100} speed={0.3} className="w-full h-full" />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-36 pb-24">
            <motion.span
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[10px] font-mono uppercase tracking-[0.15em] rounded-full px-4 py-1.5 mb-8"
              style={{
                color: "oklch(0.50 0.02 260)",
                border: "1px solid oklch(0.20 0.01 260 / 0.5)",
                background: "oklch(0.10 0.005 260 / 0.5)",
              }}
            >
              28 components &middot; 4 hooks &middot; shadcn-compatible
            </motion.span>
            <motion.h1
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl font-bold tracking-[-0.035em] mb-4"
              style={{
                background: "linear-gradient(180deg, oklch(0.97 0.005 260), oklch(0.60 0.01 260))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ui-for-ai
            </motion.h1>
            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-lg md:text-xl mb-2"
              style={{ color: "oklch(0.55 0.01 260)" }}
            >
              Make AI interfaces feel alive.
            </motion.p>
            <motion.p
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-[13px] max-w-md mb-10"
              style={{ color: "oklch(0.38 0.01 260)" }}
            >
              Drop-in animated components for streaming, thinking, agent workflows, and every AI state. Copy-paste. Zero lock-in.
            </motion.p>
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center gap-3 flex-wrap justify-center"
            >
              <a
                href="https://github.com/bardbyte/ui-for-ai"
                className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
                style={{
                  background: "oklch(0.95 0.005 260)",
                  color: "oklch(0.08 0.005 260)",
                }}
              >
                GitHub
              </a>
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                style={{
                  background: "oklch(0.10 0.005 260 / 0.8)",
                  border: "1px solid oklch(0.20 0.01 260 / 0.4)",
                }}
              >
                <code className="text-[11px] font-mono" style={{ color: "oklch(0.50 0.02 260)" }}>
                  npx shadcn add streaming-text
                </code>
                <CopyButton value="npx shadcn@latest add https://uiforai.dev/r/streaming-text.json" />
              </div>
            </motion.div>
          </div>
        </GridBackground>
      </div>

      {/* Gradient divider */}
      <div className="h-px mx-auto max-w-4xl" style={{ background: "linear-gradient(90deg, transparent, oklch(0.25 0.02 260 / 0.5), transparent)" }} />

      {/* Component showcases */}
      <div className="relative max-w-4xl mx-auto px-6 py-20" style={{ zIndex: 1 }}>
        <StreamingShowcase />
        <ThinkingShowcase />
        <ReasoningShowcase />
        <MarkdownShowcase />
        <AgentShowcase />
        <ToolCallShowcase />
        <GlowShowcase />
        <TabsShowcase />

        {/* Wave 2: Structural Components */}
        <ApprovalShowcase />
        <CitationShowcase />
        <CodeArtifactShowcase />
        <SkeletonShowcase />
        <EdgeStateShowcase />
        <MessageBranchShowcase />
        <DataShowcase />

        {/* Footer */}
        <div className="mt-24 text-center pt-12 pb-8">
          <div className="h-px mx-auto max-w-xs mb-12" style={{ background: "linear-gradient(90deg, transparent, oklch(0.20 0.01 260 / 0.4), transparent)" }} />
          <p className="text-[14px] mb-1" style={{ color: "oklch(0.45 0.01 260)" }}>
            Built for the humans building AI.
          </p>
          <p className="text-[12px]" style={{ color: "oklch(0.28 0.01 260)" }}>
            Agents don&apos;t need UI. You do.
          </p>
        </div>
      </div>
    </div>
  );
}
