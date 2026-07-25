/**
 * Multi-tenant access helpers.
 * Every organization-scoped query must include organizationId.
 */

export class TenantScopeError extends Error {
  constructor(message = "organizationId is required for tenant-scoped access") {
    super(message);
    this.name = "TenantScopeError";
  }
}

export function requireOrganizationId(organizationId: string | null | undefined): string {
  if (!organizationId) {
    throw new TenantScopeError();
  }
  return organizationId;
}

export function tenantWhere<T extends Record<string, unknown>>(
  organizationId: string,
  where: T = {} as T,
): T & { organizationId: string } {
  return {
    ...where,
    organizationId: requireOrganizationId(organizationId),
  };
}
