/**
 * RBAC permission catalog (foundation).
 * Enforcement lives in @mysimcha/auth; this package owns the vocabulary.
 */

export const ORG_ROLES = ["OWNER", "ADMIN", "EDITOR", "VIEWER"] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

export const PLATFORM_ROLES = [
  "PLATFORM_SUPER",
  "PLATFORM_SUPPORT",
  "PLATFORM_BILLING",
  "PLATFORM_READONLY",
] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const PERMISSIONS = [
  "org:read",
  "org:update",
  "org:delete",
  "member:invite",
  "member:update",
  "member:remove",
  "event:create",
  "event:read",
  "event:update",
  "event:publish",
  "event:delete",
  "media:upload",
  "media:delete",
  "billing:read",
  "billing:manage",
  "guest:manage",
  "analytics:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Static matrix — source of truth for org RBAC. */
export const ROLE_PERMISSIONS: Record<OrgRole, readonly Permission[]> = {
  OWNER: PERMISSIONS,
  ADMIN: PERMISSIONS.filter((p) => p !== "org:delete"),
  EDITOR: [
    "org:read",
    "event:create",
    "event:read",
    "event:update",
    "event:publish",
    "media:upload",
    "media:delete",
    "guest:manage",
    "analytics:read",
  ],
  VIEWER: ["org:read", "event:read", "analytics:read", "billing:read"],
};

export function roleHasPermission(role: OrgRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
