import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";
import { assertPermission, assertPlatformRole, AuthorizationError } from "./rbac";

describe("password hashing", () => {
  it("hashes and verifies passwords", async () => {
    const hashed = await hashPassword("password123");
    expect(hashed).not.toBe("password123");
    expect(await verifyPassword("password123", hashed)).toBe(true);
    expect(await verifyPassword("wrong", hashed)).toBe(false);
  });
});

describe("assertPermission", () => {
  it("allows owners org:delete", () => {
    expect(() =>
      assertPermission({ organizationId: "o1", role: "OWNER" }, "org:delete"),
    ).not.toThrow();
  });

  it("blocks viewers from member:invite", () => {
    expect(() =>
      assertPermission({ organizationId: "o1", role: "VIEWER" }, "member:invite"),
    ).toThrow(AuthorizationError);
  });
});

describe("assertPlatformRole", () => {
  it("allows PLATFORM_SUPER for admin surfaces", () => {
    expect(() =>
      assertPlatformRole(
        { id: "u1", email: "admin@example.com", platformRole: "PLATFORM_SUPER" },
        ["PLATFORM_SUPER", "PLATFORM_SUPPORT"],
      ),
    ).not.toThrow();
  });

  it("blocks org-only users from platform admin", () => {
    expect(() =>
      assertPlatformRole({ id: "u1", email: "owner@example.com", platformRole: null }, [
        "PLATFORM_SUPER",
      ]),
    ).toThrow(AuthorizationError);
  });
});
