import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, slugifyOrganizationName } from "./auth-schemas";

describe("auth schemas", () => {
  it("normalizes email on register", () => {
    const result = registerSchema.parse({
      name: "Dana",
      email: "Dana@Example.COM",
      password: "password123",
      organizationName: "Dana Events",
    });
    expect(result.email).toBe("dana@example.com");
  });

  it("rejects short passwords", () => {
    expect(() =>
      loginSchema.parse({ email: "a@b.com", password: "" }),
    ).toThrow();
  });

  it("slugifies organization names", () => {
    expect(slugifyOrganizationName("Dana's Events!")).toBe("dana-s-events");
    expect(slugifyOrganizationName("!!!")).toBe("org");
  });
});
