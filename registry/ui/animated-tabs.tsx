"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface AnimatedTabsProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  children: ReactNode;
  className?: string;
}

const spring = { type: "spring" as const, stiffness: 350, damping: 30 };

/**
 * Tab navigation with sliding indicator and content cross-fade.
 * Perfect for switching between AI output modes (text, code, preview).
 */
export function AnimatedTabs({
  tabs,
  activeTab: controlledTab,
  onTabChange,
  children,
  className,
}: AnimatedTabsProps) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id ?? "");
  const prefersReduced = useReducedMotion();

  const activeId = controlledTab ?? internalTab;
  const activeIndex = tabs.findIndex((t) => t.id === activeId);

  const handleTabChange = (id: string) => {
    if (!controlledTab) setInternalTab(id);
    onTabChange?.(id);
  };

  return (
    <div className={className}>
      {/* Tab list */}
      <div
        role="tablist"
        style={{
          display: "flex",
          position: "relative",
          borderBottom: "1px solid oklch(0.5 0 0 / 0.15)",
          gap: 0,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeId}
            aria-controls={`panel-${tab.id}`}
            onClick={() => handleTabChange(tab.id)}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              color:
                tab.id === activeId
                  ? "oklch(0.9 0 0)"
                  : "oklch(0.5 0 0)",
              fontWeight: tab.id === activeId ? 500 : 400,
              transition: "color 150ms",
              zIndex: 1,
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}

        {/* Sliding indicator */}
        {activeIndex >= 0 && (
          <motion.div
            layoutId="tab-indicator"
            transition={prefersReduced ? { duration: 0 } : spring}
            style={{
              position: "absolute",
              bottom: -1,
              height: 2,
              background: "oklch(0.7 0.15 250)",
              borderRadius: 1,
              // Position calculated from tab elements
              left: `${(activeIndex / tabs.length) * 100}%`,
              width: `${100 / tabs.length}%`,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeId}
            role="tabpanel"
            id={`panel-${activeId}`}
            aria-labelledby={activeId}
            initial={
              prefersReduced
                ? undefined
                : { opacity: 0, x: 10 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              prefersReduced
                ? undefined
                : { opacity: 0, x: -10 }
            }
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
