"use client";

import { useSyncExternalStore } from "react";
import { pageKindForPath, type RoofHubTool, type ToolContextSnapshot } from "@/lib/tool-context";

const listeners = new Set<() => void>();
let snapshot: ToolContextSnapshot = {
  path: "",
  pageKind: "other",
  topic: "",
  activeTool: "none",
  step: "",
  updatedAt: new Date(0).toISOString()
};

function notify(): void {
  for (const listener of listeners) listener();
}

function currentPath(): string {
  return typeof window === "undefined" ? "" : window.location.pathname;
}

export function getToolContext(): ToolContextSnapshot {
  const path = currentPath() || snapshot.path;
  return path === snapshot.path ? snapshot : { ...snapshot, path, pageKind: pageKindForPath(path) };
}

export function setToolContext(input: Partial<Omit<ToolContextSnapshot, "updatedAt">>): ToolContextSnapshot {
  const path = input.path ?? currentPath() ?? snapshot.path;
  snapshot = {
    ...snapshot,
    ...input,
    path,
    pageKind: input.pageKind ?? pageKindForPath(path),
    updatedAt: new Date().toISOString()
  };
  notify();
  return snapshot;
}

export function registerToolContext(activeTool: RoofHubTool, step = "", topic = ""): () => void {
  setToolContext({ activeTool, step, topic });
  return () => {
    if (snapshot.activeTool === activeTool) setToolContext({ activeTool: "none", step: "" });
  };
}

export function subscribeToolContext(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useToolContext(): ToolContextSnapshot {
  return useSyncExternalStore(subscribeToolContext, getToolContext, () => snapshot);
}
