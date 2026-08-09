import type { OrgRole, Permission, PlatformRole } from "@mysimcha/shared";
import { PLATFORM_ROLES } from "@mysimcha/shared";
import { findMembership } from "@mysimcha/database";
import { auth } from "./config";
import {
  assertPermission,
  assertPlatformRole,
  AuthorizationError,
  type MembershipContext,
  type SessionUser,
} from "./rbac";

export async function getSession() {
  return auth();
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthorizationError("Unauthenticated");
  }
  return session;
}

export async function requireMembership(organizationId: string): Promise<{
  user: SessionUser;
  membership: MembershipContext;
}> {
  const session = await requireSession();
  const membership = await findMembership(organizationId, session.user.id);
  if (!membership) {
    throw new AuthorizationError("Not a member of this organization");
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      platformRole: session.user.platformRole,
    },
    membership: {
      organizationId: membership.organizationId,
      role: membership.role as OrgRole,
    },
  };
}

export async function requirePermission(organizationId: string, permission: Permission) {
  const ctx = await requireMembership(organizationId);
  assertPermission(ctx.membership, permission);
  return ctx;
}

export async function requirePlatformRole(allowed: readonly PlatformRole[] = PLATFORM_ROLES) {
  const session = await requireSession();
  assertPlatformRole(
    {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      platformRole: session.user.platformRole,
    },
    allowed,
  );
  return session;
}

export async function requireActiveOrganization() {
  const session = await requireSession();
  const organizationId = session.user.organizationId;
  if (!organizationId || !session.user.organizationRole) {
    throw new AuthorizationError("No active organization");
  }
  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      platformRole: session.user.platformRole,
    } satisfies SessionUser,
    membership: {
      organizationId,
      role: session.user.organizationRole,
    } satisfies MembershipContext,
  };
}
