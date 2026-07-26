/**
 * Rate limiter port (Clean Architecture).
 * Application code depends on this interface only.
 * Swap MemoryRateLimiter → RedisRateLimiter later without changing callers.
 */

export type RateLimitResult = {
  /** Whether the request is allowed under the current budget. */
  allowed: boolean;
  /** Remaining tokens in the window after this check (0 if denied). */
  remaining: number;
  /** Unix ms when the current window resets. */
  resetAt: number;
  /** Configured max attempts for this key/window. */
  limit: number;
};

export type RateLimitConsumeOptions = {
  /** Max successful consumes per window. */
  limit: number;
  /** Sliding/fixed window length in milliseconds. */
  windowMs: number;
};

/**
 * Pluggable rate limiter.
 * Implementations must be safe for concurrent awaits within a single Node process.
 */
export interface RateLimiter {
  /**
   * Record one attempt for `key`.
   * Returns whether the attempt is within budget.
   */
  consume(key: string, options: RateLimitConsumeOptions): Promise<RateLimitResult>;

  /** Clear counters for a key (tests / admin unlock). */
  reset(key: string): Promise<void>;
}

export class RateLimitExceededError extends Error {
  readonly code = "RATE_LIMITED" as const;
  readonly result: RateLimitResult;

  constructor(result: RateLimitResult, message = "Too many requests. Please try again later.") {
    super(message);
    this.name = "RateLimitExceededError";
    this.result = result;
  }
}
