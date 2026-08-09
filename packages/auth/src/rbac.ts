import {
  type OrgRole,
  type Permission,
  type PlatformRole,
  roleHasPermission,
} from "@mysimcha/shared";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  platformRole?: PlatformRole | null;
};

export type MembershipContext = {
  organizationId: string;
  role: OrgRole;
};

export class AuthorizationError extends Error {
  readonly code = "FORBIDDEN" as const;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function assertPermission(membership: MembershipContext, permission: Permission): void {
  if (!roleHasPermission(membership.role, permission)) {
    throw new AuthorizationError(`Missing permission: ${permission}`);
  }
}

export function assertPlatformRole(
  user: SessionUser,
  allowed: readonly PlatformRole[],
): void {
  if (!user.platformRole || !allowed.includes(user.platformRole)) {
    throw new AuthorizationError("Missing platform role");
  }
}

/** Auth.js route/config mount path — apps import and extend. */
export const AUTH_ROUTE_PREFIX = "/api/auth";
