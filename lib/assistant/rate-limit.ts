const WINDOW_MS = 60 * 60_000;
const hits = new Map<string, number[]>();

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkAssistantIpRateLimit(ip: string): { ok: true } | { ok: false; error: string } {
  const now = Date.now();
  if (hits.size > 5_000) {
    for (const [key, values] of hits) if (!values.some(value => now - value < WINDOW_MS)) hits.delete(key);
  }
  const current = (hits.get(ip) ?? []).filter(value => now - value < WINDOW_MS);
  if (current.filter(value => now - value < 60_000).length >= 30) return { ok: false, error: "The assistant is receiving too many requests from this connection. Please try again shortly." };
  if (current.length >= 300) return { ok: false, error: "The assistant request limit for this connection has been reached for now." };
  current.push(now);
  hits.set(ip, current);
  return { ok: true };
}
