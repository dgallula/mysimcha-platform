/**
 * Auth-surface rate limiting.
 * Depends on RateLimiter port from @mysimcha/shared — never on a concrete store.
 */

import {
  getRateLimiter,
  RateLimitExceededError,
  type RateLimitResult,
} from "@mysimcha/shared";

export type AuthRateLimitKind = "login" | "register";

function readPositiveInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

/** Auth endpoints use stricter defaults than the general RATE_LIMIT_MAX catalog. */
export function getAuthRateLimitConfig() {
  return {
    windowMs: readPositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    /** Max attempts per key (IP or email) per window. */
    limit: readPositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 10),
  };
}

export function authRateLimitKey(
  kind: AuthRateLimitKind,
  dimension: "ip" | "email",
  value: string,
): string {
  const normalized = value.trim().toLowerCase();
  return `auth:${kind}:${dimension}:${normalized}`;
}

/**
 * Consume one attempt for a key; throw RateLimitExceededError when denied.
 */
export async function assertWithinRateLimit(
  key: string,
  config = getAuthRateLimitConfig(),
): Promise<RateLimitResult> {
  const result = await getRateLimiter().consume(key, config);
  if (!result.allowed) {
    throw new RateLimitExceededError(result);
  }
  return result;
}

/**
 * Apply IP + identity (email) budgets for an auth action.
 * Both must pass — either dimension can block.
 */
export async function assertAuthRateLimits(input: {
  kind: AuthRateLimitKind;
  ip: string;
  email: string;
}): Promise<void> {
  const config = getAuthRateLimitConfig();
  await assertWithinRateLimit(authRateLimitKey(input.kind, "ip", input.ip), config);
  await assertWithinRateLimit(authRateLimitKey(input.kind, "email", input.email), config);
}
