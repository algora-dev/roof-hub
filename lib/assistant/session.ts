import type { AssistantMessage } from "@/lib/assistant/types";

const REDIS_PREFIX = "roofhub:assistant:session:";
const SESSION_TTL_MS = 8 * 60 * 60_000;
const MAX_MESSAGES = 28;

export type AssistantSession = {
  sessionId: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: number;
  messages: AssistantMessage[];
  turnCount: number;
  messageTimestamps: number[];
};

const memorySessions = new Map<string, AssistantSession>();

function redisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function redisCommand(args: Array<string | number>): Promise<unknown> {
  const cfg = redisConfig();
  if (!cfg) throw new Error("Redis session storage is not configured.");
  const response = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Redis returned ${response.status}.`);
  const payload = await response.json() as { result?: unknown; error?: string };
  if (payload.error) throw new Error(payload.error);
  return payload.result;
}

function newSession(sessionId: string): AssistantSession {
  const now = Date.now();
  return {
    sessionId,
    createdAt: new Date(now).toISOString(),
    lastActiveAt: new Date(now).toISOString(),
    expiresAt: now + SESSION_TTL_MS,
    messages: [],
    turnCount: 0,
    messageTimestamps: []
  };
}

function sweepMemory() {
  if (memorySessions.size < 300) return;
  const now = Date.now();
  for (const [id, session] of memorySessions) if (session.expiresAt <= now) memorySessions.delete(id);
}

export async function getAssistantSession(sessionId: string): Promise<AssistantSession> {
  const cfg = redisConfig();
  if (cfg) {
    try {
      const raw = await redisCommand(["GET", `${REDIS_PREFIX}${sessionId}`]);
      if (typeof raw === "string" && raw) {
        const parsed = JSON.parse(raw) as AssistantSession;
        if (parsed.expiresAt > Date.now()) return parsed;
      }
    } catch (error) {
      console.error("[roofhub-assistant] Redis read failed; using process memory.", error instanceof Error ? error.message : error);
    }
  }
  sweepMemory();
  const existing = memorySessions.get(sessionId);
  if (existing && existing.expiresAt > Date.now()) return existing;
  return newSession(sessionId);
}

export async function saveAssistantSession(session: AssistantSession): Promise<void> {
  const now = Date.now();
  session.lastActiveAt = new Date(now).toISOString();
  session.expiresAt = now + SESSION_TTL_MS;
  session.messages = session.messages.slice(-MAX_MESSAGES);
  const ttlSeconds = Math.max(60, Math.ceil(SESSION_TTL_MS / 1000));
  const cfg = redisConfig();
  if (cfg) {
    try {
      await redisCommand(["SET", `${REDIS_PREFIX}${session.sessionId}`, JSON.stringify(session), "EX", ttlSeconds]);
      return;
    } catch (error) {
      console.error("[roofhub-assistant] Redis write failed; using process memory.", error instanceof Error ? error.message : error);
    }
  }
  memorySessions.set(session.sessionId, session);
}

export function checkAssistantSessionGuard(session: AssistantSession, message: string): { ok: true } | { ok: false; status: number; error: string } {
  const trimmed = message.trim();
  if (!trimmed) return { ok: false, status: 400, error: "Please type a question." };
  if (trimmed.length > 1800) return { ok: false, status: 400, error: "Please keep the question under 1,800 characters." };
  if (session.turnCount >= 80) return { ok: false, status: 429, error: "This assistant session has reached its conversation limit. Open a new tab to start a fresh session." };

  const now = Date.now();
  session.messageTimestamps = session.messageTimestamps.filter(value => now - value < 60 * 60_000);
  if (session.messageTimestamps.filter(value => now - value < 60_000).length >= 12) return { ok: false, status: 429, error: "You're sending questions quickly. Please wait a moment and try again." };
  if (session.messageTimestamps.length >= 80) return { ok: false, status: 429, error: "This assistant session has reached its hourly message limit." };
  session.messageTimestamps.push(now);
  return { ok: true };
}
