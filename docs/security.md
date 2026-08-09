# Security Foundation — MySimcha Platform

## Principles

1. **Least privilege** — every actor has the minimum role needed.
2. **Defense in depth** — authn, authz, validation, rate limits, audit.
3. **Tenant isolation** — organization boundaries are security boundaries.
4. **Secrets never in git** — Vercel/GitHub Environments + `.env.example` only.
5. **Secure by default** — deny unless policy allows.

---

## Authentication

**Provider:** Auth.js (NextAuth v5) in `@mysimcha/auth`.  
**Sprint 1 status:** **completed** on `apps/web`.

| Concern | Approach |
|---------|----------|
| Session | JWT sessions (required by Auth.js Credentials). `Session` / `Account` tables remain for future OAuth / DB-session revocation. |
| Providers | Email/password credentials. Later: magic link (Resend), Google, Apple as needed |
| CSRF | Auth.js built-in for `/api/auth` |
| Host trust | Prefer `AUTH_TRUST_HOST` only in known environments |
| Cookies | `__Secure-` / `HttpOnly` / `SameSite=Lax` (Strict where possible) |

`apps/admin` requires a `PLATFORM_*` session (`requirePlatformRole`). Organization owners without a platform role are rejected. Seed: `admin@example.com` / `password123`.

---

## RBAC model

### Organization roles

| Role | Capabilities |
|------|----------------|
| `OWNER` | Full org control, billing, delete |
| `ADMIN` | Manage members, events, settings |
| `EDITOR` | Create/edit events & media |
| `VIEWER` | Read-only |

### Platform roles (admin app)

| Role | Capabilities |
|------|----------------|
| `PLATFORM_SUPER` | All ops |
| `PLATFORM_SUPPORT` | Read tenant data, limited mutations |
| `PLATFORM_BILLING` | Subscriptions/invoices support |
| `PLATFORM_READONLY` | Audit & metrics only |

### Permission checks

Central helper: `assertPermission(actor, action, resource)`.

Actions are enumerated strings, e.g. `event:publish`, `billing:manage`, `member:invite`.

Guest/public actions use **token capabilities** (invitation token, QR nonce), not user roles.

---

## API security

| Control | Implementation |
|---------|----------------|
| Input validation | Zod schemas in `@mysimcha/shared` on every Server Action / Route Handler |
| Output minimization | Never return other tenants' fields |
| Auth gate | Session required unless public procedure |
| AuthZ gate | Membership + permission |
| Idempotency | Stripe webhooks & payment intents keyed |
| HTTP headers | Shared `nextSecurityHeaders()` — CSP, HSTS (prod), X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options |
| CORS | Restrict to known brand domains + app URLs |

Server Actions are treated as public endpoints — same validation and authz as REST.

---

## Rate limiting

**Sprint 2:** Node-only, pluggable `RateLimiter` in `@mysimcha/shared`.

| Piece | Location |
|-------|----------|
| Port (interface) | `RateLimiter` |
| Dev / current prod driver | `MemoryRateLimiter` (in-process fixed window) |
| Composition | `getRateLimiter()` / `setRateLimiter()` (DI) |
| Auth guard | `assertAuthRateLimits()` in `@mysimcha/auth` |

**Not in Sprint 2:** Redis, queues, or brokers. A future `RedisRateLimiter` can implement the same interface without changing login/register callers.

| Surface | Default budget |
|---------|----------------|
| Auth login/register | 10 / 15 min per IP **and** per email (`AUTH_RATE_LIMIT_*`) |
| General catalog | `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` (reserved) |
| Public RSVP / AI | Later |

---

## Secrets management

| Environment | Mechanism |
|-------------|-----------|
| Local | `.env` / `.env.local` (gitignored) |
| CI | GitHub Actions secrets / OIDC |
| Production | Vercel env (per app) + restricted access |
| Rotation | Documented runbook; Stripe/Twilio/Auth secrets rotatable |

Never log secrets, webhook payloads with PII beyond need, or full payment card data (Stripe handles PAN).

---

## Audit logs

`AuditLog` records:

- `actorUserId` (nullable for system)
- `organizationId` (nullable for platform)
- `action`
- `resourceType` / `resourceId`
- `ip` / `userAgent` (hashed or truncated if required)
- `metadata` (non-sensitive JSON)
- `createdAt`

Required for: login failures (optional), role changes, billing changes, data exports, erasures, impersonation (if ever enabled).

---

## Media security

- Signed upload tokens; no open upload endpoints.
- Organization-scoped folder prefixes in Cloudinary.
- Virus scanning / type allowlists at upload boundary (foundation contract).
- Public delivery only for assets marked public / attached to published events.

---

## GDPR / privacy foundation

| Requirement | Foundation |
|-------------|------------|
| Lawful basis tracking | Stored on org/settings (later UI) |
| Access / export | Export job contract |
| Erasure | Soft-delete + hard-delete pipeline design |
| DPA vendors | Stripe, Resend, Twilio, Cloudinary, Sentry, PostHog, Vercel, AI providers |
| Cookie consent | Landing/web ready for banner integration |
| Data residency | Document region choices (e.g. EU Postgres) in deployment docs |

Minimize PII in analytics; prefer hashed IDs where possible.

---

## Threat model (abbreviated)

| Threat | Mitigation |
|--------|------------|
| Cross-tenant read | Required `organizationId` + tests |
| Invitation token leak | High-entropy tokens, expiry, single-use options |
| Webhook forgery | Stripe/Twilio signature verification |
| XSS | React escaping + CSP + sanitization for rich text |
| SSRF via media URLs | Allowlist fetch targets |
| Privilege escalation | RBAC unit tests; no client-trusted roles |
| Dependency compromise | pnpm lockfile, Dependabot, CI audit |

---

## Security testing

- Vitest policy unit tests for RBAC matrix (org + platform)
- Playwright (`apps/web/e2e`) — unauthenticated `/dashboard` redirect + seed login
- Periodic dependency scanning in CI
- Sentry for anomaly breadcrumbs (no secrets)

---

See also: [Architecture](./architecture.md) · [Database](./database.md) · [API](./api.md)
