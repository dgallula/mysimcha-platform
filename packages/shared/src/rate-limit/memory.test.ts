import { describe, expect, it, beforeEach } from "vitest";
import { MemoryRateLimiter } from "./memory";
import {
  createRateLimiter,
  getRateLimiter,
  resetRateLimiterForTests,
  setRateLimiter,
} from "./factory";

describe("MemoryRateLimiter", () => {
  let limiter: MemoryRateLimiter;

  beforeEach(() => {
    limiter = new MemoryRateLimiter();
  });

  it("allows requests under the limit", async () => {
    const first = await limiter.consume("login:ip:1", { limit: 3, windowMs: 60_000 });
    const second = await limiter.consume("login:ip:1", { limit: 3, windowMs: 60_000 });

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it("denies when limit is exceeded", async () => {
    await limiter.consume("login:email:a", { limit: 2, windowMs: 60_000 });
    await limiter.consume("login:email:a", { limit: 2, windowMs: 60_000 });
    const denied = await limiter.consume("login:email:a", { limit: 2, windowMs: 60_000 });

    expect(denied.allowed).toBe(false);
    expect(denied.remaining).toBe(0);
    expect(denied.limit).toBe(2);
  });

  it("isolates keys", async () => {
    await limiter.consume("a", { limit: 1, windowMs: 60_000 });
    const other = await limiter.consume("b", { limit: 1, windowMs: 60_000 });
    expect(other.allowed).toBe(true);
  });

  it("resets a key", async () => {
    await limiter.consume("k", { limit: 1, windowMs: 60_000 });
    await limiter.reset("k");
    const again = await limiter.consume("k", { limit: 1, windowMs: 60_000 });
    expect(again.allowed).toBe(true);
  });
});

describe("rate limiter factory", () => {
  beforeEach(() => {
    resetRateLimiterForTests();
  });

  it("defaults to MemoryRateLimiter", () => {
    const limiter = createRateLimiter("memory");
    expect(limiter).toBeInstanceOf(MemoryRateLimiter);
  });

  it("supports DI via setRateLimiter", async () => {
    const custom = new MemoryRateLimiter();
    setRateLimiter(custom);
    expect(getRateLimiter()).toBe(custom);
    await getRateLimiter().consume("di", { limit: 1, windowMs: 1000 });
  });

  it("rejects redis driver until an adapter exists", () => {
    expect(() => createRateLimiter("redis")).toThrow(/not implemented/);
  });
});
