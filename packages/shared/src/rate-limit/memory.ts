import type { RateLimitConsumeOptions, RateLimitResult, RateLimiter } from "./types";

type Bucket = {
  count: number;
  resetAt: number;
};

/**
 * In-process fixed-window rate limiter.
 * Suitable for single-instance Node (local/dev, single Vercel serverless isolate).
 * Not shared across multiple server instances — replace with RedisRateLimiter later.
 */
export class MemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  async consume(key: string, options: RateLimitConsumeOptions): Promise<RateLimitResult> {
    const { limit, windowMs } = options;
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      this.buckets.set(key, bucket);
    }

    if (bucket.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: bucket.resetAt,
        limit,
      };
    }

    bucket.count += 1;

    return {
      allowed: true,
      remaining: Math.max(0, limit - bucket.count),
      resetAt: bucket.resetAt,
      limit,
    };
  }

  async reset(key: string): Promise<void> {
    this.buckets.delete(key);
  }

  /** Test / ops helper — clear all keys. */
  async clear(): Promise<void> {
    this.buckets.clear();
  }

  /** Approximate active key count (debug). */
  size(): number {
    return this.buckets.size;
  }
}
