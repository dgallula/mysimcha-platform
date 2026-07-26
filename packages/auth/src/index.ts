/**
 * @mysimcha/auth — Auth.js configuration + RBAC enforcement.
 */

export {
  assertPermission,
  assertPlatformRole,
  AuthorizationError,
  AUTH_ROUTE_PREFIX,
  type MembershipContext,
  type SessionUser,
} from "./rbac";

export { hashPassword, verifyPassword } from "./password";
export { handlers, auth, signIn, signOut } from "./config";
export {
  getSession,
  requireSession,
  requireMembership,
  requirePermission,
  requireActiveOrganization,
} from "./session";
export {
  assertAuthRateLimits,
  assertWithinRateLimit,
  authRateLimitKey,
  getAuthRateLimitConfig,
  type AuthRateLimitKind,
} from "./rate-limit";
