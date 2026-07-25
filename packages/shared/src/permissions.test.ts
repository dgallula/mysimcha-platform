import { describe, expect, it } from "vitest";
import { roleHasPermission } from "./permissions";

describe("RBAC matrix", () => {
  it("allows owners to manage billing", () => {
    expect(roleHasPermission("OWNER", "billing:manage")).toBe(true);
  });

  it("denies viewers from publishing events", () => {
    expect(roleHasPermission("VIEWER", "event:publish")).toBe(false);
  });

  it("allows editors to upload media", () => {
    expect(roleHasPermission("EDITOR", "media:upload")).toBe(true);
  });
});
