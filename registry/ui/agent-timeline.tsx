"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "running" | "complete" | "error";
  timestamp?: Date;
  details?: ReactNode;
}

export interface AgentTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

const statusColors: Record<TimelineStep["status"], string> = {
  pending: "oklch(0.4 0 0)",
  running: "oklch(0.7 0.15 250)",
  complete: "oklch(0.7 0.15 145)",
  error: "oklch(0.65 0.2 25)",
};

const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

/**
 * Vertical timeline of agent execution steps with live progress.
 * Running steps pulse, completed steps get checkmarks,
 * new steps animate in with staggered entrance.
 */
export function AgentTimeline({ steps, className }: AgentTimelineProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div
      className={className}
      role="list"
      aria-label="Agent execution timeline"
      style={{ position: "relative", paddingLeft: 24 }}
    >
      {/* Connecting line */}
      <div
        style={{
          position: "absolute",
          left: 7,
          top: 12,
          bottom: 12,
          width: 2,
          background: "oklch(0.3 0 0)",
        }}
      />

      {/* Progress line */}
      {steps.length > 0 && (
        <motion.div
          style={{
            position: "absolute",
            left: 7,
            top: 12,
            width: 2,
            background: "oklch(0.7 0.15 250)",
          }}
          animate={{
            height: `${(steps.filter((s) => s.status === "complete" || s.status === "running").length / Math.max(steps.length, 1)) * 100}%`,
          }}
          transition={prefersReduced ? { duration: 0 } : spring}
        />
      )}

      {/* Steps */}
      <AnimatePresence initial={false}>
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            role="listitem"
            aria-current={step.status === "running" ? "step" : undefined}
            aria-label={`${step.title}: ${step.status}`}
            initial={
              prefersReduced ? undefined : { opacity: 0, y: 8 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={
              prefersReduced
                ? { duration: 0 }
                : { ...spring, delay: index * 0.05 }
            }
            style={{
              position: "relative",
              paddingBottom: 20,
              paddingLeft: 16,
            }}
          >
            {/* Dot */}
            <div
              style={{
                position: "absolute",
                left: -24,
                top: 4,
                width: 16,
                height: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {step.status === "running" && !prefersReduced ? (
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: statusColors.running,
                    boxShadow: `0 0 8px ${statusColors.running}`,
                  }}
                />
              ) : step.status === "complete" ? (
                <motion.svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={statusColors.complete}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={prefersReduced ? undefined : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={spring}
                >
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
              ) : step.status === "error" ? (
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: statusColors.error,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    border: `2px solid ${statusColors.pending}`,
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div style={{ fontSize: 13, fontWeight: 500 }}>{step.title}</div>
            {step.description && (
              <div
                style={{
                  fontSize: 12,
                  color: "oklch(0.55 0 0)",
                  marginTop: 2,
                }}
              >
                {step.description}
              </div>
            )}
            {step.timestamp && (
              <div
                style={{
                  fontSize: 11,
                  color: "oklch(0.4 0 0)",
                  marginTop: 2,
                }}
              >
                {step.timestamp.toLocaleTimeString()}
              </div>
            )}
            {step.details && (
              <div style={{ marginTop: 8 }}>{step.details}</div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
