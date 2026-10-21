"use client";

import { useSyncExternalStore } from "react";
import {
  createRoofProject,
  parseRoofProject,
  ROOF_PROJECT_STORAGE_KEY,
  touchRoofProject,
  type RoofProject,
  type RoofProjectEntryPoint
} from "@/lib/roof-project";

let cached: RoofProject | null | undefined;
const listeners = new Set<() => void>();

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

function notify(): void {
  for (const listener of listeners) listener();
}

function read(): RoofProject | null {
  if (cached !== undefined) return cached;
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(ROOF_PROJECT_STORAGE_KEY);
    cached = raw ? parseRoofProject(JSON.parse(raw)) : null;
  } catch {
    cached = null;
  }
  return cached;
}

function write(project: RoofProject | null): RoofProject | null {
  cached = project;
  const store = storage();
  if (store) {
    try {
      if (project) store.setItem(ROOF_PROJECT_STORAGE_KEY, JSON.stringify(project));
      else store.removeItem(ROOF_PROJECT_STORAGE_KEY);
    } catch {
      // The active tool still works if browser storage is unavailable.
    }
  }
  notify();
  return project;
}

export function getRoofProject(): RoofProject | null {
  return read();
}

export function getOrCreateRoofProject(entryPoint: RoofProjectEntryPoint = "unknown"): RoofProject {
  return read() ?? write(createRoofProject(entryPoint))!;
}

export function setRoofProject(value: RoofProject): RoofProject {
  const parsed = parseRoofProject(value);
  if (!parsed) throw new Error("Invalid RoofProject payload.");
  return write(touchRoofProject(parsed))!;
}

export function updateRoofProject(updater: (project: RoofProject) => RoofProject, entryPoint: RoofProjectEntryPoint = "unknown"): RoofProject {
  const current = getOrCreateRoofProject(entryPoint);
  return setRoofProject(updater(current));
}

export function clearRoofProject(): void {
  write(null);
}

export function subscribeRoofProject(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useRoofProject(): RoofProject | null {
  return useSyncExternalStore(subscribeRoofProject, getRoofProject, () => null);
}
