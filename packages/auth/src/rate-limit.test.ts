import { describe, expect, it, beforeEach } from "vitest";
import {
  MemoryRateLimiter,
  RateLimitExceededError,
  resetRateLimiterForTests,
  setRateLimiter,
} from "@mysimcha/shared";
import {
  assertAuthRateLimits,
  authRateLimitKey,
  getAuthRateLimitConfig,
} from "./rate-limit";

describe("auth rate limit guard", () => {
  beforeEach(() => {
    resetRateLimiterForTests();
    setRateLimiter(new MemoryRateLimiter());
    process.env.AUTH_RATE_LIMIT_MAX = "2";
    process.env.AUTH_RATE_LIMIT_WINDOW_MS = "60000";
  });

  it("builds stable keys", () => {
    expect(authRateLimitKey("login", "email", " Dana@Example.COM ")).toBe(
      "auth:login:email:dana@example.com",
    );
  });

  it("reads auth-specific env defaults", () => {
    expect(getAuthRateLimitConfig()).toEqual({ limit: 2, windowMs: 60_000 });
  });

  it("allows under budget then blocks", async () => {
    await assertAuthRateLimits({ kind: "login", ip: "1.1.1.1", email: "a@b.com" });
    await assertAuthRateLimits({ kind: "login", ip: "1.1.1.1", email: "a@b.com" });
    await expect(
      assertAuthRateLimits({ kind: "login", ip: "1.1.1.1", email: "a@b.com" }),
    ).rejects.toBeInstanceOf(RateLimitExceededError);
  });
});
