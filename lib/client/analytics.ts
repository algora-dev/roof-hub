"use client";

import type { RoofHubAnalyticsContext, RoofHubAnalyticsEvent } from "@/lib/analytics-events";

type Gtag = (command: "event", event: string, params?: Record<string, string>) => void;
type Clarity = (command: "event", event: string) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    clarity?: Clarity;
  }
}

function clean(value: string | undefined, max = 120): string | undefined {
  if (!value) return undefined;
  return value.trim().slice(0, max) || undefined;
}

function safePath(path: string | undefined): string | undefined {
  if (path) return clean(path.split("?")[0].split("#")[0], 300);
  if (typeof window === "undefined") return undefined;
  return clean(window.location.pathname, 300);
}

export function trackRoofHubEvent(event: RoofHubAnalyticsEvent, context: RoofHubAnalyticsContext = {}): void {
  if (typeof window === "undefined") return;
  const params: Record<string, string> = {};
  const path = safePath(context.path);
  const values: Record<string, string | undefined> = {
    path,
    entry_point: clean(context.entryPoint),
    cta_location: clean(context.ctaLocation),
    tool: context.tool,
    project_type: context.projectType,
    roof_system: context.roofSystem,
    detail_level: context.detailLevel,
    step: clean(context.step),
    knowledge_confidence: context.knowledgeConfidence,
    knowledge_match: clean(context.knowledgeMatch, 80),
    gap_reason: context.gapReason,
    knowledge_topic: context.knowledgeTopic,
    feedback: context.feedback
  };
  for (const [key, value] of Object.entries(values)) if (value) params[key] = value;

  try {
    window.gtag?.("event", event, params);
  } catch {
    // Analytics must never interrupt the active tool.
  }
  try {
    window.clarity?.("event", event);
  } catch {
    // Analytics must never interrupt the active tool.
  }
}
