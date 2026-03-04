import crypto from "node:crypto";

const cache = new Map<string, { value: unknown; expiresAt: number }>();
const rateWindows = new Map<string, { count: number; resetAt: number }>();

const ttl = Number(process.env.LLM_CACHE_TTL_MS ?? 120_000);
const windowMs = Number(process.env.LLM_RATE_LIMIT_WINDOW_MS ?? 60_000);
const max = Number(process.env.LLM_RATE_LIMIT_MAX ?? 40);

export const makeCacheKey = (input: unknown) =>
  crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");

export const getCached = <T>(key: string): T | null => {
  const hit = cache.get(key);
  if (!hit) {
    return null;
  }

  if (hit.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }

  return hit.value as T;
};

export const setCached = (key: string, value: unknown) => {
  cache.set(key, { value, expiresAt: Date.now() + ttl });
};

export const checkRateLimit = (identifier: string) => {
  const now = Date.now();
  const row = rateWindows.get(identifier);

  if (!row || row.resetAt <= now) {
    rateWindows.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  if (row.count >= max) {
    return { allowed: false, remaining: 0, retryAt: row.resetAt };
  }

  row.count += 1;
  rateWindows.set(identifier, row);
  return { allowed: true, remaining: max - row.count };
};
