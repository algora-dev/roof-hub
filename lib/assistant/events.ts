"use client";

export const ASSISTANT_OPEN_EVENT = "roofhub:assistant-open";
export type AssistantOpenDetail = { prompt?: string; send?: boolean };

export function openRoofHubAssistant(detail: AssistantOpenDetail = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AssistantOpenDetail>(ASSISTANT_OPEN_EVENT, { detail }));
}
