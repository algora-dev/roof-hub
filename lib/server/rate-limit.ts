import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let checks = 0;

function prune(now: number): void {
  checks += 1;
  if (checks % 100 !== 0 && buckets.size < 10_000) return;
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
  if (buckets.size > 20_000) buckets.clear();
}

function requestAddress(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function anonymousKey(value: string): string {
  return createHash("sha256").update(value).digest("base64url").slice(0, 24);
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRequestRateLimit(
  request: NextRequest,
  options: { namespace: string; limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  prune(now);
  const key = `${options.namespace}:${anonymousKey(requestAddress(request))}`;
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + options.windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  const allowed = bucket.count <= options.limit;
  return {
    allowed,
    remaining: Math.max(0, options.limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
  };
}
