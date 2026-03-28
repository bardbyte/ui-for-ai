# ui-for-ai: Premium Component Visual Specification

A pixel-precise redesign specification for 6 key components. Every value is exact
and implementable. Nothing is vague.

---

## Table of Contents

1. [StreamingText](#1-streamingtext)
2. [ThinkingIndicator](#2-thinkingindicator)
3. [AIGlow](#3-aiglow)
4. [AgentNode](#4-agentnode)
5. [ToolCallCard](#5-toolcallcard)
6. [Showcase Page Layout](#6-showcase-page-layout)

---

## Design Tokens (Shared)

These tokens underpin every component. Define them once.

```css
/* globals.css additions */
:root {
  /* --- Radii --- */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* --- Spacing (4px grid) --- */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  /* --- Brand Palette (oklch for perceptual uniformity) --- */
  --color-ai-blue: oklch(0.72 0.14 250);
  --color-ai-violet: oklch(0.65 0.20 280);
  --color-ai-cyan: oklch(0.78 0.12 200);
  --color-ai-green: oklch(0.72 0.16 155);
  --color-ai-amber: oklch(0.78 0.14 75);
  --color-ai-red: oklch(0.65 0.22 25);

  /* --- Surface colors --- */
  --surface-0: oklch(0.08 0.005 260);     /* page background */
  --surface-1: oklch(0.12 0.005 260);     /* card background */
  --surface-2: oklch(0.16 0.005 260);     /* elevated/hover */
  --surface-3: oklch(0.20 0.005 260);     /* active state */

  /* --- Text --- */
  --text-primary: oklch(0.93 0.005 260);
  --text-secondary: oklch(0.62 0.01 260);
  --text-tertiary: oklch(0.45 0.01 260);
  --text-ghost: oklch(0.32 0.01 260);

  /* --- Border --- */
  --border-subtle: oklch(0.20 0.005 260);
  --border-default: oklch(0.25 0.01 260);
  --border-hover: oklch(0.35 0.02 260);

  /* --- Shadows (layered for realism) --- */
  --shadow-sm:
    0 1px 2px oklch(0 0 0 / 0.3),
    0 1px 3px oklch(0 0 0 / 0.15);
  --shadow-md:
    0 2px 4px oklch(0 0 0 / 0.3),
    0 4px 12px oklch(0 0 0 / 0.2),
    0 1px 2px oklch(0 0 0 / 0.15);
  --shadow-lg:
    0 4px 8px oklch(0 0 0 / 0.3),
    0 8px 24px oklch(0 0 0 / 0.25),
    0 12px 48px oklch(0 0 0 / 0.15);
  --shadow-glow-blue:
    0 0 20px oklch(0.72 0.14 250 / 0.15),
    0 0 60px oklch(0.72 0.14 250 / 0.08);
  --shadow-glow-violet:
    0 0 20px oklch(0.65 0.20 280 / 0.15),
    0 0 60px oklch(0.65 0.20 280 / 0.08);

  /* --- Noise texture (inline SVG data URI) --- */
  --noise-texture: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
}
```

```ts
/* motion presets — import these in every component */
export const spring = {
  gentle: { type: "spring", stiffness: 120, damping: 14 } as const,
  snappy: { type: "spring", stiffness: 300, damping: 24 } as const,
  bouncy: { type: "spring", stiffness: 400, damping: 15 } as const,
  stiff:  { type: "spring", stiffness: 500, damping: 30 } as const,
};

export const ease = {
  out: [0.16, 1, 0.3, 1] as const,       // fast start, gentle stop (Apple-like)
  inOut: [0.76, 0, 0.24, 1] as const,     // smooth both ends (Linear-like)
  overshoot: [0.34, 1.56, 0.64, 1] as const, // subtle overshoot
};
```

---

## 1. StreamingText

### The Problem with the Current Version

- Tokens just fade in — no spatial context for "where" the stream is
- The cursor is a 2px rectangle with basic opacity toggle — indistinguishable from a text caret
- No luminous quality — settled text looks exactly like appearing text
- Every word is a `motion.span` with identical treatment — no wave/cascade feeling

### The Vision

Text should feel like it is *materializing* from a luminous source. The latest words
carry a soft glow that fades as they settle. The cursor is a living, breathing element
that pulls your eye to the frontier of generation. Already-settled text lives at full
opacity; incoming text transitions from a dimmed, slightly blurred state.

### Exact Specifications

#### New Mode: `"luminous"` (Default)

```ts
// This is the star mode. Make it the default.
const luminousVariants = {
  hidden: {
    opacity: 0.0,
    filter: "blur(8px)",
    color: "oklch(0.93 0.005 260 / 0.3)",   // ghostly dim
  },
  settling: {
    opacity: 0.85,
    filter: "blur(1px)",
    color: "oklch(0.93 0.14 250 / 1)",       // blue-tinted luminance
    textShadow: "0 0 20px oklch(0.72 0.14 250 / 0.4), 0 0 40px oklch(0.72 0.14 250 / 0.15)",
  },
  visible: {
    opacity: 1.0,
    filter: "blur(0px)",
    color: "oklch(0.93 0.005 260 / 1)",       // neutral full brightness
    textShadow: "none",
  },
};

// Three-phase transition:
// 1. hidden -> settling  (fast, when token first appears)
// 2. settling -> visible (slower, glow fades as text "cools down")
const luminousTransition = {
  hidden_to_settling: {
    duration: 0.15,
    ease: [0.16, 1, 0.3, 1],     // Apple ease-out
  },
  settling_to_visible: {
    duration: 0.6,
    ease: [0.76, 0, 0.24, 1],    // Linear ease-in-out
    delay: 0.3,                    // holds the glow briefly
  },
};
```

**Implementation approach:** Each token gets three states. On mount, animate
`hidden -> settling` immediately. After 300ms, animate `settling -> visible`.
The last 3-5 tokens at any time are in the "settling" state, creating a luminous
wavefront that travels with the stream.

#### The Cursor

Kill the blinking rectangle. Replace with an organic, breathing cursor:

```ts
// The cursor: a soft capsule with inner glow
const cursorStyle: CSSProperties = {
  display: "inline-block",
  width: 3,                                    // 3px, not 2 — more visible
  height: "1.1em",
  marginLeft: 4,
  borderRadius: 2,                             // capsule, not rectangle
  background: "oklch(0.72 0.14 250)",          // brand blue
  verticalAlign: "text-bottom",
  boxShadow:
    "0 0 8px oklch(0.72 0.14 250 / 0.6), " +  // tight glow
    "0 0 24px oklch(0.72 0.14 250 / 0.3)",     // diffuse glow
};

// Cursor animation: a smooth sine-wave pulse, NOT a harsh on/off blink
const cursorAnimation = {
  animate: {
    opacity: [1, 0.4, 1],                     // never fully disappears
    scaleY: [1, 0.92, 1],                     // subtle breathing height
    boxShadow: [
      "0 0 8px oklch(0.72 0.14 250 / 0.6), 0 0 24px oklch(0.72 0.14 250 / 0.3)",
      "0 0 4px oklch(0.72 0.14 250 / 0.3), 0 0 12px oklch(0.72 0.14 250 / 0.1)",
      "0 0 8px oklch(0.72 0.14 250 / 0.6), 0 0 24px oklch(0.72 0.14 250 / 0.3)",
    ],
  },
  transition: {
    duration: 1.2,                              // slower than typical 0.8s blink
    repeat: Infinity,
    ease: "easeInOut",                          // smooth sine, no step-end
  },
};
```

#### Updated Existing Modes

```ts
// "blur-in" — increase the blur distance and add a subtle y-shift
const blurInVariants = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 6 },   // was blur(4px), y:0
  visible: { opacity: 1, filter: "blur(0px)", y: 0 },
};
const blurInTransition = {
  duration: 0.35,                                         // was 0.4
  ease: [0.16, 1, 0.3, 1],                               // Apple ease-out
};

// "slide-up" — add slight scale and stagger
const slideUpVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },             // was y:4, no scale
  visible: { opacity: 1, y: 0, scale: 1 },
};
const slideUpTransition = {
  type: "spring",
  stiffness: 350,                                         // was 400
  damping: 22,                                            // was 30 (more bounce)
};

// "fade" — add a very subtle blur for texture
const fadeVariants = {
  hidden: { opacity: 0, filter: "blur(2px)" },            // was just opacity
  visible: { opacity: 1, filter: "blur(0px)" },
};
const fadeTransition = {
  duration: 0.25,                                          // was 0.3
  ease: [0.16, 1, 0.3, 1],
};
```

### What Makes It Premium vs Generic

| Generic | Premium |
|---------|---------|
| All tokens animate identically | Last 3-5 tokens carry a luminous glow that fades |
| Binary cursor blink (on/off) | Breathing cursor with glow that pulses smoothly |
| Text appears then just sits | Text materializes (blur), glows briefly (settling), then cools to normal |
| `opacity: [1, 0]` cursor | `opacity: [1, 0.4, 1]` with `scaleY` and `boxShadow` breathing |
| No textShadow | Settling tokens have `textShadow` with blue luminance |
| One transition per token | Two sequential transitions (fast appear, slow settle) |

### Reference Products

- **Vercel's Streamdown 2.2** — per-word text animation with smooth entrance
- **ChatGPT** — their cursor has a soft glow (not just a rectangle)
- **Notion AI** — text materializes with a brief brightness peak
- **Linear changelogs** — text entrance uses subtle blur-to-sharp transition

---

## 2. ThinkingIndicator

### The Problem with the Current Version

- Three colored dots with scale/opacity oscillation — this is literally the
  default "AI is thinking" pattern from 2023
- Each state just changes the dots' timing parameters — no visual differentiation
- The orbs have no depth, glow, or organic quality
- "Not bouncing dots" is claimed in the JSDoc, but it IS bouncing dots

### The Vision

A single, multi-layered luminous orb that morphs between states. Think Apple's Siri
orb (fluid, mesmerizing) crossed with a glassmorphic sphere. When thinking, internal
layers rotate at different speeds. When deep-thinking, the orb splits into orbiting
fragments. When tool-calling, it pulses with a scanning sweep. One iconic element,
not three generic dots.

### Exact Specifications

#### The Core Orb (Replaces Three Dots)

```ts
// Sizes
const sizes = {
  sm: { diameter: 24, innerPadding: 3 },
  md: { diameter: 36, innerPadding: 4 },
  lg: { diameter: 48, innerPadding: 5 },
};
```

```css
/* The orb container */
.thinking-orb {
  position: relative;
  border-radius: 9999px;
  /* Glassmorphic shell */
  background: oklch(0.16 0.01 260 / 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid oklch(0.30 0.02 260 / 0.3);
  overflow: hidden;
}

/* Inner gradient layer 1 — the "soul" of the orb */
.thinking-orb__core {
  position: absolute;
  inset: 20%;
  border-radius: 9999px;
  background: radial-gradient(
    circle at 40% 35%,
    oklch(0.72 0.14 250 / 0.9),     /* bright blue center */
    oklch(0.65 0.20 280 / 0.6) 50%, /* violet mid */
    oklch(0.50 0.10 250 / 0.0) 100% /* fade to transparent */
  );
  filter: blur(3px);
}

/* Inner gradient layer 2 — counter-rotating for fluidity */
.thinking-orb__fluid {
  position: absolute;
  inset: 15%;
  border-radius: 9999px;
  background: conic-gradient(
    from 0deg,
    oklch(0.78 0.12 200 / 0.0),     /* transparent cyan */
    oklch(0.72 0.14 250 / 0.5),     /* blue */
    oklch(0.65 0.20 280 / 0.5),     /* violet */
    oklch(0.78 0.12 200 / 0.0)      /* back to transparent */
  );
  filter: blur(4px);
  mix-blend-mode: screen;
}

/* Specular highlight — the glassy "catch light" */
.thinking-orb__highlight {
  position: absolute;
  top: 8%;
  left: 15%;
  width: 40%;
  height: 25%;
  border-radius: 9999px;
  background: linear-gradient(
    180deg,
    oklch(1.0 0 0 / 0.25) 0%,
    oklch(1.0 0 0 / 0.0) 100%
  );
  filter: blur(2px);
}

/* Outer glow — varies with state */
.thinking-orb__glow {
  position: absolute;
  inset: -40%;
  border-radius: 9999px;
  pointer-events: none;
  filter: blur(20px);
  /* color set dynamically per state */
}
```

#### State Animations (Motion Config)

```ts
// THINKING: Slow, contemplative rotation. Both inner layers rotate.
const thinkingAnimation = {
  core: {
    animate: { rotate: 360 },
    transition: { duration: 8, repeat: Infinity, ease: "linear" },
  },
  fluid: {
    animate: { rotate: -360 },
    transition: { duration: 12, repeat: Infinity, ease: "linear" },
  },
  glow: {
    animate: {
      opacity: [0.15, 0.3, 0.15],
      scale: [1.0, 1.1, 1.0],
    },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  glowColor: "oklch(0.72 0.14 250 / 0.3)",
};

// DEEP THINKING: Faster, more intense. The orb "breathes" larger.
const deepThinkingAnimation = {
  container: {
    animate: {
      scale: [1.0, 1.08, 1.0],      // visible breathing
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  core: {
    animate: { rotate: 360 },
    transition: { duration: 4, repeat: Infinity, ease: "linear" },  // 2x faster
  },
  fluid: {
    animate: { rotate: -360 },
    transition: { duration: 6, repeat: Infinity, ease: "linear" },
  },
  glow: {
    animate: {
      opacity: [0.2, 0.45, 0.2],
      scale: [1.0, 1.3, 1.0],
    },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  glowColor: "oklch(0.65 0.20 280 / 0.4)",  // violet
};

// TOOL CALLING: Pulsing scan ring. The orb stays still, a ring sweeps around it.
const toolCallingAnimation = {
  core: {
    // Static — tools are precise, not fluid
    animate: { rotate: 0 },
  },
  // A conic gradient ring that rotates around the orb
  scanRing: {
    // Render as a pseudo-element or separate div around the orb
    style: {
      position: "absolute" as const,
      inset: -3,
      borderRadius: "9999px",
      background: "conic-gradient(from 0deg, transparent 0%, oklch(0.78 0.12 200 / 0.6) 30%, transparent 60%)",
      // This is the scanning sweep
    },
    animate: { rotate: 360 },
    transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
  },
  glow: {
    animate: { opacity: [0.15, 0.35, 0.15] },
    transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
  },
  glowColor: "oklch(0.78 0.12 200 / 0.3)",  // cyan
};

// STREAMING: The orb smoothly elongates into a horizontal pill, suggesting flow.
const streamingAnimation = {
  container: {
    animate: {
      scaleX: [1.0, 1.15, 1.0],     // stretches horizontally
      scaleY: [1.0, 0.92, 1.0],     // compresses vertically
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  core: {
    animate: {
      x: ["-10%", "10%", "-10%"],    // the core shifts inside
    },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
  glow: {
    animate: { opacity: [0.1, 0.2, 0.1] },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
  glowColor: "oklch(0.72 0.12 250 / 0.2)",  // subtle blue
};

// COMPLETE: The orb morphs into a checkmark. Spring in, glow flash, then fade.
const completeAnimation = {
  container: {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  glowFlash: {
    // Brief bright flash then fade
    animate: { opacity: [0, 0.5, 0], scale: [0.8, 1.5, 1.5] },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
  glowColor: "oklch(0.72 0.16 155 / 0.4)",  // green
  // Render a checkmark SVG inside the orb
  checkmark: {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.15 },
      opacity: { duration: 0.1 },
    },
  },
};

// ERROR: Shake + red flash. The orb briefly distorts.
const errorAnimation = {
  container: {
    animate: { x: [0, -4, 4, -4, 2, 0] },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  glow: {
    animate: { opacity: [0, 0.5, 0.25] },
    transition: { duration: 0.4 },
  },
  glowColor: "oklch(0.65 0.22 25 / 0.4)",  // red
  // The core gradient shifts to red
  coreBackground: `radial-gradient(
    circle at 40% 35%,
    oklch(0.65 0.22 25 / 0.9),
    oklch(0.50 0.15 25 / 0.0) 100%
  )`,
};
```

### What Makes It Premium vs Generic

| Generic (Three Dots) | Premium (Luminous Orb) |
|---|---|
| Three separate elements | Single cohesive element with internal layers |
| Flat solid colors | Radial + conic gradients with blur and blend modes |
| `scale: [1, 1.3, 1]` | Multi-layer rotation, breathing, morphing |
| Same shape for every state | Orb transforms (breathes, stretches, scan ring, distorts) |
| No depth | Glassmorphic shell, specular highlight, diffuse glow |
| Looks like a loading spinner | Looks like a living, thinking entity |

### Reference Products

- **Apple Siri orb** (iOS 18) — multi-layer gradient, specular highlight, organic motion
- **Claude.ai** thinking state — soft glowing element, not dots
- **Perplexity** — scanning ring during search (the conic gradient sweep idea)
- **Raycast AI** — single luminous indicator with state morphing

---

## 3. AIGlow

### The Problem with the Current Version

- Single radial gradient with opacity pulse. Flat. One-dimensional.
- No noise texture for organic feel
- No independent layer movement
- Color transitions are instant (animate background), not flowing
- "Aurora" effect requires overlapping, independently-moving layers

### The Vision

Three overlapping gradient blobs that drift independently, creating an
ever-shifting aurora. A subtle noise texture overlay adds grain for organic feel.
Color shifts happen slowly and continuously, feeling biological. The effect has
true depth because the layers blend with `mix-blend-mode`.

### Exact Specifications

#### Layer Architecture

```
Layer Stack (bottom to top):
  [0] Page background (--surface-0)
  [1] Gradient blob A — large, slow-moving, primary color
  [2] Gradient blob B — medium, counter-moving, secondary color
  [3] Gradient blob C — small, fastest, accent color
  [4] Noise texture overlay (SVG feTurbulence, opacity 0.03-0.06)
  [5] Content (children)
```

#### CSS for Each Layer

```css
/* Container */
.ai-glow {
  position: relative;
  overflow: hidden;
  /* Optional: clip to rounded rect */
  border-radius: var(--radius-lg);
}

/* Shared blob base */
.ai-glow__blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(80px);
  pointer-events: none;
  will-change: transform;
  /* mix-blend-mode is the secret to organic overlaps */
  mix-blend-mode: screen;
}

/* Blob A — Primary. Takes up ~60% of container. */
.ai-glow__blob--a {
  width: 60%;
  height: 60%;
  top: 10%;
  left: 15%;
  background: radial-gradient(
    ellipse at center,
    oklch(0.72 0.14 250 / 0.4),   /* blue */
    transparent 70%
  );
}

/* Blob B — Secondary. ~45% of container. Offset. */
.ai-glow__blob--b {
  width: 45%;
  height: 55%;
  top: 30%;
  right: 10%;
  background: radial-gradient(
    ellipse at center,
    oklch(0.65 0.20 280 / 0.3),   /* violet */
    transparent 70%
  );
}

/* Blob C — Accent. ~35% of container. Fastest. */
.ai-glow__blob--c {
  width: 35%;
  height: 40%;
  bottom: 15%;
  left: 25%;
  background: radial-gradient(
    ellipse at center,
    oklch(0.78 0.12 200 / 0.25),  /* cyan */
    transparent 70%
  );
}

/* Noise overlay */
.ai-glow__noise {
  position: absolute;
  inset: -20%;                     /* overflow to avoid edge artifacts */
  background-image: var(--noise-texture);
  background-size: 200px 200px;
  opacity: 0.04;
  pointer-events: none;
  mix-blend-mode: overlay;
}
```

#### Motion Configs Per State

```ts
// IDLE: Near-static. Blobs barely drift. Very low opacity.
const idleMotion = {
  blobA: {
    animate: {
      x: ["0%", "3%", "0%"],
      y: ["0%", "-2%", "0%"],
      opacity: 0.08,
    },
    transition: { duration: 20, repeat: Infinity, ease: "linear" },
  },
  blobB: {
    animate: {
      x: ["0%", "-2%", "0%"],
      y: ["0%", "3%", "0%"],
      opacity: 0.05,
    },
    transition: { duration: 25, repeat: Infinity, ease: "linear" },
  },
  blobC: { animate: { opacity: 0 } },  // hidden in idle
};

// THINKING: Blobs drift more, opacity increases, gentle breathing.
const thinkingMotion = {
  blobA: {
    animate: {
      x: ["0%", "8%", "-3%", "0%"],
      y: ["0%", "-5%", "6%", "0%"],
      scale: [1, 1.05, 0.98, 1],
      opacity: [0.25, 0.35, 0.25],
    },
    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
  },
  blobB: {
    animate: {
      x: ["0%", "-6%", "4%", "0%"],
      y: ["0%", "4%", "-5%", "0%"],
      scale: [1, 0.97, 1.04, 1],
      opacity: [0.2, 0.3, 0.2],
    },
    transition: { duration: 10, repeat: Infinity, ease: "easeInOut" },
  },
  blobC: {
    animate: {
      x: ["0%", "5%", "-4%", "0%"],
      y: ["0%", "-3%", "4%", "0%"],
      opacity: [0.1, 0.2, 0.1],
    },
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  },
};

// DEEP THINKING: Blobs move faster. Violet dominates. More overlap.
const deepThinkingMotion = {
  blobA: {
    animate: {
      x: ["0%", "12%", "-8%", "0%"],
      y: ["0%", "-8%", "10%", "0%"],
      scale: [1, 1.1, 0.95, 1],
      opacity: [0.3, 0.5, 0.3],
    },
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
  blobB: {
    // Violet blob becomes dominant
    animate: {
      x: ["0%", "-10%", "8%", "0%"],
      y: ["0%", "8%", "-6%", "0%"],
      scale: [1.0, 1.15, 1.0],
      opacity: [0.35, 0.55, 0.35],
    },
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  },
  blobC: {
    animate: {
      x: ["0%", "8%", "-6%", "0%"],
      y: ["0%", "-5%", "6%", "0%"],
      opacity: [0.15, 0.3, 0.15],
    },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

// TOOL CALLING: Cyan blob dominates. Sharper movements (not organic).
const toolCallingMotion = {
  blobA: {
    animate: {
      opacity: [0.1, 0.2, 0.1],
      scale: [1, 1.02, 1],
    },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  blobB: {
    animate: { opacity: 0.05 },  // nearly hidden
  },
  blobC: {
    // Cyan pulses sharply
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.2, 0.4, 0.2],
    },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
};

// ERROR: Red takes over. Blob A shifts to red. Others dim.
const errorMotion = {
  blobA: {
    // Shift to error color via background change
    // background becomes: radial-gradient(ellipse, oklch(0.65 0.22 25 / 0.5), transparent 70%)
    animate: { opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  blobB: { animate: { opacity: 0.05 } },
  blobC: { animate: { opacity: 0 } },
};

// STREAMING: Blobs drift rightward, suggesting flow/output.
const streamingMotion = {
  blobA: {
    animate: {
      x: ["0%", "10%", "0%"],
      opacity: [0.15, 0.25, 0.15],
    },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
  blobB: {
    animate: {
      x: ["0%", "8%", "0%"],
      opacity: [0.1, 0.2, 0.1],
    },
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
  },
  blobC: {
    animate: {
      x: ["0%", "6%", "0%"],
      opacity: [0.08, 0.15, 0.08],
    },
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 },
  },
};
```

### What Makes It Premium vs Generic

| Generic | Premium |
|---|---|
| One gradient blob | Three independently-moving blobs |
| No blending | `mix-blend-mode: screen` creates organic color mixing |
| No texture | SVG feTurbulence noise overlay adds grain |
| Pulse is just opacity | Position, scale, AND opacity all animate per blob |
| Same shape always | Blobs drift in figure-8 patterns, constantly reshaping overlaps |
| Mechanical feeling | Slow, organic movements feel alive — like bioluminescence |

### Reference Products

- **Stripe** gradient backgrounds — multi-blob gradients with independent movement
- **Linear** homepage — aurora-like backgrounds with noise texture
- **Apple Music** album art backgrounds — multi-color blobs with blend modes
- **Vercel** homepage — mesh gradient backgrounds between sections

---

## 4. AgentNode

### The Problem with the Current Version

- `background: oklch(0.15 0 0)` with `border: 2px solid` — looks like a default HTML element with a colored border
- No frosted glass, no depth, no inner shadow
- Icon area has no visual weight (just `fontSize: 18`)
- Ripple rings for "running" state are basic expanding borders
- No hover interaction at all

### The Vision

A premium glassmorphic card with layered surfaces, inner highlights, and a
status glow that bleeds outward from the edges. The icon sits in a distinct
well with visual weight. Hover reveals a subtle lift and shine sweep.

### Exact Specifications

#### Card Surface

```css
.agent-node {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  min-width: 180px;
  cursor: default;

  /* --- Glassmorphic surface --- */
  background:
    linear-gradient(
      135deg,
      oklch(0.18 0.01 260 / 0.8) 0%,
      oklch(0.14 0.005 260 / 0.7) 100%
    );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  /* --- Border: subtle gradient border via background-clip trick --- */
  border: 1px solid oklch(0.28 0.01 260 / 0.5);
  border-radius: 14px;

  /* --- Inner highlight: top edge catch-light --- */
  box-shadow:
    inset 0 1px 0 oklch(1.0 0 0 / 0.06),       /* top highlight */
    inset 0 -1px 0 oklch(0 0 0 / 0.2),          /* bottom shadow */
    0 2px 4px oklch(0 0 0 / 0.3),                /* drop shadow layer 1 */
    0 4px 12px oklch(0 0 0 / 0.2);               /* drop shadow layer 2 */

  /* Smooth transitions for all interactive states */
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

/* --- Hover state --- */
.agent-node:hover {
  border-color: oklch(0.35 0.02 260 / 0.6);
  box-shadow:
    inset 0 1px 0 oklch(1.0 0 0 / 0.08),
    inset 0 -1px 0 oklch(0 0 0 / 0.2),
    0 4px 8px oklch(0 0 0 / 0.3),
    0 8px 24px oklch(0 0 0 / 0.2);
  transform: translateY(-1px);                    /* subtle lift */
}

/* --- Selected state --- */
.agent-node--selected {
  border-color: oklch(0.72 0.14 250 / 0.5);
  box-shadow:
    inset 0 1px 0 oklch(1.0 0 0 / 0.06),
    inset 0 -1px 0 oklch(0 0 0 / 0.2),
    0 0 0 3px oklch(0.72 0.14 250 / 0.12),       /* focus ring */
    0 4px 12px oklch(0 0 0 / 0.3);
}
```

#### Icon Well

```css
/* The icon sits in a recessed well with its own surface */
.agent-node__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;

  /* Recessed surface */
  background: oklch(0.12 0.005 260 / 0.8);
  border: 1px solid oklch(0.22 0.01 260 / 0.3);
  box-shadow:
    inset 0 1px 3px oklch(0 0 0 / 0.3),         /* inner shadow (recessed) */
    0 1px 0 oklch(1.0 0 0 / 0.03);              /* bottom edge highlight */

  /* Icon styling */
  font-size: 14px;
  font-weight: 600;
  color: oklch(0.7 0.05 260);
}
```

#### Status Glow (Edge Bleed Effect)

```css
/* A pseudo-element behind the card that bleeds color from edges */
.agent-node__status-glow {
  position: absolute;
  inset: -1px;
  border-radius: 15px;                           /* 14 + 1 for the border offset */
  pointer-events: none;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
  /* Color set per status */
}

/* Running: blue edge glow */
.agent-node--running .agent-node__status-glow {
  opacity: 1;
  background: oklch(0.72 0.14 250 / 0.15);
  box-shadow:
    0 0 15px oklch(0.72 0.14 250 / 0.2),
    0 0 40px oklch(0.72 0.14 250 / 0.1);
  filter: blur(6px);
}

/* Success: green pulse then fade */
.agent-node--success .agent-node__status-glow {
  opacity: 1;
  background: oklch(0.72 0.16 155 / 0.12);
  box-shadow:
    0 0 12px oklch(0.72 0.16 155 / 0.15),
    0 0 30px oklch(0.72 0.16 155 / 0.08);
  filter: blur(6px);
}

/* Error: red glow */
.agent-node--error .agent-node__status-glow {
  opacity: 1;
  background: oklch(0.65 0.22 25 / 0.15);
  box-shadow:
    0 0 15px oklch(0.65 0.22 25 / 0.2),
    0 0 40px oklch(0.65 0.22 25 / 0.1);
  filter: blur(6px);
}
```

#### Running State Animation

Replace the basic RippleRing with a conic gradient scan:

```ts
// A rotating conic gradient border instead of expanding ring outlines
const runningBorderAnimation = {
  // Render a div behind the card with a conic gradient visible through 1px gap
  style: {
    position: "absolute" as const,
    inset: -2,                // slightly larger than card
    borderRadius: 16,
    background: `conic-gradient(
      from 0deg,
      oklch(0.72 0.14 250 / 0.0),
      oklch(0.72 0.14 250 / 0.5),
      oklch(0.78 0.12 200 / 0.3),
      oklch(0.72 0.14 250 / 0.0)
    )`,
    zIndex: -1,
  },
  animate: { rotate: 360 },
  transition: { duration: 3, repeat: Infinity, ease: "linear" },
};

// The card itself sits on top, so only the 1-2px gap shows the rotating gradient
// This creates a "scanning border" effect, much more premium than ripple rings
```

#### Hover Shine Sweep

```ts
// A diagonal highlight that sweeps across the card on hover
const shineSweepStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: "inherit",
  overflow: "hidden",
  pointerEvents: "none",
};

// Inside this container, a gradient div:
const shineGradient: CSSProperties = {
  position: "absolute",
  top: 0,
  left: "-100%",
  width: "60%",
  height: "100%",
  background: "linear-gradient(105deg, transparent 40%, oklch(1.0 0 0 / 0.04) 50%, transparent 60%)",
  // On hover, animate left from -100% to 200%
};

const shineSweepAnimation = {
  hover: {
    animate: { left: "200%" },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};
```

### Typography Inside the Node

```css
.agent-node__label {
  font-size: 13px;
  font-weight: 550;                             /* slightly heavier than 500 */
  color: var(--text-primary);
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.agent-node__subtitle {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-tertiary);
  letter-spacing: 0em;
  line-height: 1.3;
  margin-top: 1px;
}
```

### Reference Products

- **Stripe** dashboard cards — inner shadows + subtle top highlight
- **Linear** issue cards — glassmorphic surface, gentle lift on hover
- **Raycast** command items — icon well with recessed surface
- **Arc browser** tab cards — gradient border glow when active

---

## 5. ToolCallCard

### The Problem with the Current Version

- `border: 1px solid ${statusColors[status]}` with no background — just a bordered box
- The shimmer is a linear-gradient translateX loop — looks like a skeleton loader, not light
- Expansion is basic `height: 0 -> auto` with no content entrance
- Status icons are static SVGs with no transition weight

### The Vision

A glassmorphic card where the shimmer looks like light refracting through a lens.
Expansion feels like a drawer sliding open, with content fading in after the height
animates. Status transitions morph smoothly — not icon swaps but transformations.

### Exact Specifications

#### Card Surface

```css
.tool-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  font-size: 13px;

  /* Glassmorphic surface */
  background:
    linear-gradient(
      135deg,
      oklch(0.14 0.008 260 / 0.9) 0%,
      oklch(0.12 0.005 260 / 0.85) 100%
    );
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  /* Layered border */
  border: 1px solid oklch(0.24 0.01 260 / 0.4);

  /* Depth */
  box-shadow:
    inset 0 1px 0 oklch(1.0 0 0 / 0.04),
    0 1px 2px oklch(0 0 0 / 0.2),
    0 4px 12px oklch(0 0 0 / 0.15);
}
```

#### Premium Shimmer (Light Through Glass)

The current shimmer is a flat linear-gradient sweep. Premium shimmer is a
**multi-band refraction** effect — like light splitting through a prism:

```css
/* The shimmer overlay */
.tool-card__shimmer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.tool-card__shimmer::before {
  content: "";
  position: absolute;
  top: 0;
  left: -150%;
  width: 80%;
  height: 100%;

  /* Multi-band gradient: simulates light refraction bands */
  background: linear-gradient(
    105deg,
    transparent 0%,
    oklch(0.72 0.14 250 / 0.02) 25%,          /* faint blue band */
    oklch(0.78 0.12 200 / 0.04) 37%,          /* cyan band (brighter) */
    oklch(1.0 0 0 / 0.06) 50%,                /* white peak */
    oklch(0.65 0.20 280 / 0.04) 63%,          /* violet band */
    oklch(0.72 0.14 250 / 0.02) 75%,          /* faint blue band */
    transparent 100%
  );

  animation: tool-shimmer 2.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

@keyframes tool-shimmer {
  0% { left: -150%; }
  100% { left: 200%; }
}
```

The key difference: The old shimmer had one band (`transparent -> white -> transparent`).
This has five chromatic bands that mimic light splitting through glass.

#### Expansion Animation

Two-phase expansion: height animates first, then content fades in.

```ts
const expansionConfig = {
  // Phase 1: Height expands
  container: {
    initial: { height: 0 },
    animate: { height: "auto" },
    transition: {
      type: "spring",
      stiffness: 250,
      damping: 25,
      // Slightly bouncy — the drawer has "weight"
    },
  },
  // Phase 2: Content fades in (delayed to start after height is ~60% done)
  content: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.25,
      delay: 0.12,                              // starts during height animation
      ease: [0.16, 1, 0.3, 1],
    },
  },
};
```

#### Status Indicator Transitions

Instead of swapping entirely different SVGs, use a single morphing element:

```ts
// Status indicator: a small circle that morphs shape and color
const statusIndicator = {
  // Base: 14x14 circle
  calling: {
    // Rotating ring (same as before, but refined)
    borderWidth: 2,
    borderColor: "oklch(0.72 0.14 250)",
    borderTopColor: "transparent",
    borderRadius: "50%",
    rotate: 360,                                // continuous rotation
    transition: { duration: 0.8, repeat: Infinity, ease: "linear" },
  },
  running: {
    // Same rotating ring but faster
    borderWidth: 2,
    borderColor: "oklch(0.72 0.14 250)",
    borderTopColor: "transparent",
    borderRadius: "50%",
    rotate: 360,
    transition: { duration: 0.6, repeat: Infinity, ease: "linear" },
  },
  complete: {
    // Morph: ring stops rotating, fills green, checkmark draws
    background: "oklch(0.72 0.16 155 / 0.15)",
    borderColor: "oklch(0.72 0.16 155 / 0.5)",
    borderRadius: "50%",
    scale: [0.8, 1.1, 1],                      // pop effect
    transition: { type: "spring", stiffness: 400, damping: 15 },
    // Then draw checkmark SVG inside
    checkmark: {
      initial: { pathLength: 0 },
      animate: { pathLength: 1 },
      transition: { duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] },
    },
  },
  error: {
    background: "oklch(0.65 0.22 25 / 0.15)",
    borderColor: "oklch(0.65 0.22 25 / 0.5)",
    borderRadius: "50%",
    // X mark draws inside
    xMark: {
      initial: { pathLength: 0 },
      animate: { pathLength: 1 },
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
    },
  },
};
```

#### Status-Dependent Border Color Transition

```ts
// The card border color smoothly transitions based on status
const borderColors = {
  calling: "oklch(0.30 0.05 250 / 0.5)",       // subtle blue
  running: "oklch(0.35 0.08 250 / 0.6)",       // more visible blue
  complete: "oklch(0.30 0.06 155 / 0.4)",      // subtle green
  error: "oklch(0.30 0.08 25 / 0.5)",          // subtle red
};

// Animate via Motion:
// animate={{ borderColor: borderColors[status] }}
// transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
```

#### Header Padding and Layout

```css
.tool-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;                          /* was 8px 12px */
}

.tool-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: oklch(0.18 0.01 260 / 0.6);
  border: 1px solid oklch(0.25 0.01 260 / 0.3);
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.tool-card__name {
  font-size: 13px;
  font-weight: 550;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.tool-card__args {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
  margin-top: 2px;
  line-height: 1.4;
}

/* Separator between header and expanded content */
.tool-card__separator {
  height: 1px;
  margin: 0 14px;
  background: linear-gradient(
    90deg,
    oklch(0.24 0.01 260 / 0.0),
    oklch(0.24 0.01 260 / 0.5),
    oklch(0.24 0.01 260 / 0.0)
  );
  /* Faded edges, visible center — more elegant than solid border */
}

.tool-card__result {
  padding: 10px 14px;
  font-size: 12px;
  line-height: 1.6;
}
```

### Reference Products

- **Vercel** deployment cards — glassmorphic surface, multi-phase expansion
- **Stripe** webhook event cards — status color transitions, shimmer on pending
- **Raycast** AI command results — sliding drawer expansion with content fade
- **Linear** issue detail panels — separator with faded edges

---

## 6. Showcase Page Layout

### The Problem with the Current Version

- `bg-black text-white` with `border border-neutral-800` cards — every developer portfolio since 2022
- No scroll-driven animation (cards just sit there)
- `Section` component has no entrance animation
- The hero has `ParticleField` and `GridBackground` but no gradient mesh
- Cards are uniformly styled `rounded-xl border border-neutral-800 bg-neutral-950 p-5`
- Typography: `text-xl font-semibold` for section titles, `text-xs text-neutral-500` for subtitles — no rhythm
- No gradient mesh backgrounds between sections

### The Vision

The page itself is a demonstration of the library. Each section enters the viewport
with choreographed motion. The background has layered depth (gradient mesh, not flat
black). Cards have the glassmorphic treatment. Typography breathes with proper
hierarchy. The page makes you think "I want to build with this."

### Exact Specifications

#### Page Background

```css
/* Replace flat bg-black with layered background */
.page {
  min-height: 100vh;
  background-color: oklch(0.06 0.005 260);     /* very dark navy, NOT pure black */
  color: var(--text-primary);

  /* Gradient mesh via fixed positioned blobs */
  position: relative;
}

/* Fixed ambient gradient blobs in the background */
.page__ambient-1 {
  position: fixed;
  top: -20%;
  right: -10%;
  width: 50vw;
  height: 50vh;
  border-radius: 9999px;
  background: radial-gradient(
    ellipse at center,
    oklch(0.72 0.14 250 / 0.06),
    transparent 70%
  );
  filter: blur(100px);
  pointer-events: none;
  z-index: 0;
}

.page__ambient-2 {
  position: fixed;
  bottom: -15%;
  left: -10%;
  width: 40vw;
  height: 40vh;
  border-radius: 9999px;
  background: radial-gradient(
    ellipse at center,
    oklch(0.65 0.20 280 / 0.04),
    transparent 70%
  );
  filter: blur(100px);
  pointer-events: none;
  z-index: 0;
}
```

#### Hero Section

```css
.hero {
  position: relative;
  min-height: 560px;                            /* was 480 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 24px 80px;
  overflow: hidden;
}

/* Hero title: larger, with negative tracking for premium feel */
.hero__title {
  font-size: clamp(48px, 8vw, 88px);            /* was 5xl/7xl */
  font-weight: 700;
  letter-spacing: -0.035em;                      /* tight tracking */
  line-height: 1.0;
  color: var(--text-primary);

  /* Subtle gradient text for hero only */
  background: linear-gradient(
    180deg,
    oklch(0.95 0.005 260) 0%,
    oklch(0.65 0.02 260) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Subtitle: generous spacing */
.hero__subtitle {
  font-size: 18px;
  line-height: 1.5;
  color: var(--text-secondary);
  max-width: 440px;
  margin-top: 16px;
}

/* Tag line at top */
.hero__tag {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 9999px;
  border: 1px solid var(--border-subtle);
  background: oklch(0.10 0.005 260 / 0.6);
  backdrop-filter: blur(8px);
  margin-bottom: 28px;
}

/* CTA buttons */
.hero__cta-primary {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 550;
  border-radius: 10px;
  background: oklch(0.95 0.005 260);
  color: oklch(0.08 0.005 260);
  border: none;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);

  /* Subtle shadow for depth */
  box-shadow:
    0 1px 2px oklch(0 0 0 / 0.3),
    0 2px 8px oklch(0 0 0 / 0.15);
}

.hero__cta-primary:hover {
  background: oklch(1.0 0 0);
  transform: translateY(-1px);
  box-shadow:
    0 2px 4px oklch(0 0 0 / 0.3),
    0 4px 16px oklch(0 0 0 / 0.2);
}

/* Install command */
.hero__install {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  background: oklch(0.12 0.005 260 / 0.8);
  border: 1px solid var(--border-subtle);
  backdrop-filter: blur(8px);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-tertiary);
}
```

#### Hero Entrance Animations

```ts
const heroEntrance = {
  tag: {
    initial: { opacity: 0, y: 20, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0 },
  },
  title: {
    initial: { opacity: 0, y: 30, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 },
  },
  subtitle: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 },
  },
  cta: {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 },
  },
};
```

#### Section Component (Redesigned)

```ts
// Each section enters with scroll-triggered animation
// Use Motion's useInView or whileInView

const sectionEntrance = {
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  initial: { opacity: 0, y: 40, filter: "blur(6px)" },
  viewport: { once: true, margin: "-80px" },    // triggers 80px before entering view
  transition: {
    duration: 0.7,
    ease: [0.16, 1, 0.3, 1],
  },
};
```

```css
/* Section typography — more breathing room */
.section {
  margin-bottom: 80px;                          /* was 80 (mb-20), keep */
  position: relative;
}

.section__title {
  font-size: 24px;                              /* was text-xl (20px) */
  font-weight: 650;                             /* between semi and bold */
  letter-spacing: -0.02em;
  color: var(--text-primary);
  line-height: 1.2;
}

.section__subtitle {
  font-size: 14px;                              /* was text-xs (12px) */
  color: var(--text-tertiary);
  line-height: 1.5;
  margin-top: 6px;
  margin-bottom: 28px;                          /* was mb-6 (24px) */
  max-width: 480px;
}
```

#### Card Component (Redesigned)

```css
.showcase-card {
  border-radius: 16px;                          /* was 12px */
  overflow: hidden;
  position: relative;

  /* Glassmorphic surface */
  background:
    linear-gradient(
      135deg,
      oklch(0.12 0.008 260 / 0.9) 0%,
      oklch(0.10 0.005 260 / 0.85) 100%
    );
  border: 1px solid oklch(0.20 0.01 260 / 0.5);
  backdrop-filter: blur(12px);

  /* Inner highlight + drop shadow */
  box-shadow:
    inset 0 1px 0 oklch(1.0 0 0 / 0.03),
    0 1px 2px oklch(0 0 0 / 0.25),
    0 4px 16px oklch(0 0 0 / 0.15);

  padding: 20px;                                /* was p-5 (20px) — keep */
}

/* Card label */
.showcase-card__label {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-ghost);                     /* oklch(0.32 0.01 260) — was neutral-600 */
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 16px;
}

/* Noise texture overlay for each card (optional, subtle) */
.showcase-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--noise-texture);
  background-size: 200px 200px;
  opacity: 0.03;
  pointer-events: none;
  border-radius: inherit;
}
```

#### Card Grid Entrance (Staggered)

```ts
// Cards within a section stagger their entrance
const cardGridEntrance = {
  container: {
    // Use staggerChildren on the parent
    transition: {
      staggerChildren: 0.08,                    // 80ms between each card
      delayChildren: 0.1,
    },
  },
  item: {
    initial: { opacity: 0, y: 24, scale: 0.97 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: "-60px" },
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};
```

#### Between-Section Gradient Dividers

```css
/* Subtle gradient separator between major sections */
.section-divider {
  width: 100%;
  height: 1px;
  margin: 48px 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    oklch(0.25 0.05 250 / 0.3) 20%,
    oklch(0.30 0.08 280 / 0.4) 50%,
    oklch(0.25 0.05 250 / 0.3) 80%,
    transparent 100%
  );
}
```

#### Interactive State Buttons (Redesigned)

The state toggle buttons in the showcase are currently basic bordered pills.

```css
.state-button {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-family: var(--font-mono);
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);

  /* Default state */
  background: oklch(0.10 0.005 260 / 0.6);
  border: 1px solid oklch(0.22 0.01 260 / 0.4);
  color: var(--text-tertiary);
}

.state-button:hover {
  border-color: oklch(0.30 0.02 260 / 0.6);
  color: var(--text-secondary);
  background: oklch(0.14 0.005 260 / 0.8);
}

.state-button--active {
  background: oklch(0.72 0.14 250 / 0.1);
  border-color: oklch(0.72 0.14 250 / 0.3);
  color: oklch(0.72 0.14 250);
  box-shadow: 0 0 12px oklch(0.72 0.14 250 / 0.08);
}
```

#### Footer (Redesigned)

```css
.footer {
  text-align: center;
  padding: 48px 24px 40px;
  margin-top: 64px;
  border-top: 1px solid var(--border-subtle);
  position: relative;
}

/* Gradient glow above the footer line */
.footer::before {
  content: "";
  position: absolute;
  top: -1px;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    oklch(0.72 0.14 250 / 0.3),
    transparent
  );
}

.footer__tagline {
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 450;
}

.footer__subline {
  font-size: 12px;
  color: var(--text-ghost);
  margin-top: 4px;
}
```

### What Makes It Premium vs Generic

| Generic | Premium |
|---|---|
| `bg-black` | `oklch(0.06 0.005 260)` — dark navy, not flat black (adds warmth) |
| No ambient light | Two fixed gradient blobs create subtle ambient washes |
| Cards appear instantly | Sections + cards enter with scroll-triggered staggered animation |
| `border-neutral-800` borders | Glassmorphic surfaces with inner highlights and drop shadows |
| Pure white text | Gradient text on hero title (bright at top, dimmer at bottom) |
| `text-xl` section titles | 24px with -0.02em tracking and weight 650 (between semi and bold) |
| No dividers | Gradient dividers with color that references the brand palette |
| Flat `bg-neutral-950` cards | Multi-layer glassmorphic cards with noise texture overlay |
| No motion on scroll | Every section blurs in with staggered card entrances |

### Reference Products

- **Linear** homepage — scroll-reveal sections, gradient mesh backgrounds, tight typography
- **Vercel** homepage — section stagger, dark navy (not black), gradient dividers
- **Stripe** documentation — card glassmorphism with inner highlights
- **Raycast** marketing — hero entrance with blur-to-sharp, staggered CTAs
- **Arc browser** website — gradient text, ambient background blobs

---

## Implementation Priority

1. **Showcase Page Layout** — highest visual impact, affects perception of everything else
2. **StreamingText** — the hero component of the library, must look signature
3. **ThinkingIndicator** — most visible, most compared to competitors
4. **ToolCallCard** — frequently used in demos
5. **AgentNode** — specialized but important for the workflow showcase
6. **AIGlow** — foundational effect, improvements compound across other components

---

## Sources

- [CSS/JS Animation Trends 2026](https://webpeak.org/blog/css-js-animation-trends/)
- [Vercel Streamdown 2.2](https://vercel.com/changelog/streamdown-2-2)
- [Flowtoken Animated Streaming](https://github.com/vercel/ai/discussions/2391)
- [Recreating Apple's Liquid Glass Effect](https://dev.to/kevinbism/recreating-apples-liquid-glass-effect-with-pure-css-3gpl)
- [Apple's Liquid Glass CSS Guide](https://dev.to/gruszdev/apples-liquid-glass-revolution-how-glassmorphism-is-shaping-ui-design-in-2025-with-css-code-1221)
- [Getting Clarity on Apple's Liquid Glass](https://css-tricks.com/getting-clarity-on-apples-liquid-glass/)
- [Glassmorphism Design Trend Guide](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide)
- [Aurora Background Component](https://ui.aceternity.com/components/aurora-background)
- [CSS Aurora Effect](https://dev.to/oobleck/css-aurora-effect-569n)
- [Grainy Gradients CSS-Tricks](https://css-tricks.com/grainy-gradients/)
- [SVG Noise Texture Generator](https://www.fffuel.co/nnnoise/)
- [Aceternity Glowing Effect](https://ui.aceternity.com/components/glowing-effect)
- [Aceternity Box Shadows](https://ui.aceternity.com/tools/box-shadows)
- [Motion for React](https://motion.dev/docs/react)
- [Motion Spring Animations](https://motion.dev/docs/react-use-spring)
- [Glassmorphism in 2026](https://invernessdesignstudio.com/glassmorphism-what-it-is-and-how-to-use-it-in-2026)
- [Liquid Glass Effects with CSS and SVG](https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/)
