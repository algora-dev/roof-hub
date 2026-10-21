"use client";

import { ASSISTANT_SESSION_HEADER, normaliseAssistantClientSessionKey } from "@/lib/assistant/session-scope";

export const ASSISTANT_CLIENT_SESSION_STORAGE_KEY = "roofhub.smart-assistant.tab-session.v1";
let memoryKey: string | null = null;

function createKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return `tab_${crypto.randomUUID()}`;
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return `tab_${Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("")}`;
  }
  return `tab_${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function getAssistantClientSessionKey(): string {
  if (typeof window === "undefined") return "";
  if (memoryKey) return memoryKey;
  try {
    const stored = normaliseAssistantClientSessionKey(window.sessionStorage.getItem(ASSISTANT_CLIENT_SESSION_STORAGE_KEY));
    if (stored) {
      memoryKey = stored;
      return stored;
    }
  } catch {
    // Restricted browser storage falls back to a page-lifecycle identity.
  }
  memoryKey = createKey();
  try { window.sessionStorage.setItem(ASSISTANT_CLIENT_SESSION_STORAGE_KEY, memoryKey); } catch { /* optional */ }
  return memoryKey;
}

export function assistantSessionFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const key = getAssistantClientSessionKey();
  if (key) headers.set(ASSISTANT_SESSION_HEADER, key);
  return fetch(input, { ...init, headers });
}

export function resetAssistantClientSession(): string {
  memoryKey = null;
  if (typeof window !== "undefined") {
    try { window.sessionStorage.removeItem(ASSISTANT_CLIENT_SESSION_STORAGE_KEY); } catch { /* optional */ }
  }
  return getAssistantClientSessionKey();
}
