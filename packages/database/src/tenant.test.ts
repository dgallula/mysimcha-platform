import { describe, expect, it } from "vitest";
import { TenantScopeError, requireOrganizationId, tenantWhere } from "./tenant";

describe("tenant helpers", () => {
  it("requires organizationId", () => {
    expect(() => requireOrganizationId(undefined)).toThrow(TenantScopeError);
    expect(requireOrganizationId("org-1")).toBe("org-1");
  });

  it("always injects organizationId into where clauses", () => {
    expect(tenantWhere("org-a", { status: "ACTIVE" })).toEqual({
      status: "ACTIVE",
      organizationId: "org-a",
    });
  });

  it("does not allow caller to omit organizationId", () => {
    expect(() => tenantWhere("", { id: "x" })).toThrow(TenantScopeError);
  });
});
