export const ASSISTANT_SESSION_HEADER = "x-roofhub-assistant-session";
const CLIENT_KEY_PATTERN = /^tab_[A-Za-z0-9-]{20,100}$/;

export function normaliseAssistantClientSessionKey(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return CLIENT_KEY_PATTERN.test(trimmed) ? trimmed : null;
}

export function assistantScopedSessionId(clientSessionKey: string): string | null {
  const key = normaliseAssistantClientSessionKey(clientSessionKey);
  return key ? `rh-assistant-${key.slice(4)}` : null;
}

export function assistantClientSessionKeyFromRequest(request: Request): string | null {
  return normaliseAssistantClientSessionKey(request.headers.get(ASSISTANT_SESSION_HEADER));
}
