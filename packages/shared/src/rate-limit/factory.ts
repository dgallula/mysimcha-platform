/**
 * Rate-limit composition root helpers.
 * Application code should call getRateLimiter() — never construct drivers inline.
 */

import { MemoryRateLimiter } from "./memory";
import type { RateLimiter } from "./types";

/** Supported drivers. `redis` reserved — adapter not shipped in Sprint 2. */
export type RateLimitDriver = "memory" | "redis";

let limiter: RateLimiter | undefined;

/**
 * Construct a RateLimiter for the given driver.
 * Sprint 2 ships `memory` only. Calling `redis` throws until an adapter is added.
 */
export function createRateLimiter(driver: RateLimitDriver = "memory"): RateLimiter {
  switch (driver) {
    case "memory":
      return new MemoryRateLimiter();
    case "redis":
      throw new Error(
        'Rate limit driver "redis" is not implemented yet. Use RATE_LIMIT_DRIVER=memory.',
      );
    default: {
      const _exhaustive: never = driver;
      throw new Error(`Unsupported rate limit driver: ${String(_exhaustive)}`);
    }
  }
}

/**
 * Process-wide RateLimiter singleton.
 * Default driver: memory. If RATE_LIMIT_DRIVER=redis before an adapter exists,
 * falls back to memory so Sprint 2 never requires Redis.
 */
export function getRateLimiter(): RateLimiter {
  if (!limiter) {
    // Sprint 2: always memory. Future: branch on RATE_LIMIT_DRIVER and construct RedisRateLimiter.
    limiter = createRateLimiter("memory");
  }
  return limiter;
}

/** Dependency injection for tests or future composition roots (e.g. Fastify). */
export function setRateLimiter(next: RateLimiter): void {
  limiter = next;
}

export function resetRateLimiterForTests(): void {
  limiter = undefined;
}
