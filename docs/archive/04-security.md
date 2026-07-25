# 04 — Security Foundation

## Principles

1. **Least privilege** — every actor has the minimum role needed.
2. **Defense in depth** — authn, authz, validation, rate limits, audit.
3. **Tenant isolation** — organization boundaries are security boundaries.
4. **Secrets never in git** — Vercel/GitHub Environments + `.env.example` only.
5. **Secure by default** — deny unless policy allows.

---

## Authentication

**Provider:** Auth.js (NextAuth v5) in `@mysimcha/auth`.

| Concern | Approach |
|---------|----------|
| Session | Database sessions or JWT (decision locked in auth package; prefer database sessions for revocation) |
| Providers | Email magic link (Resend), Google, Apple (as needed) |
| CSRF | Auth.js built-in |
| Host trust | `AUTH_TRUST_HOST` only in known environments |
| Cookies | `__Secure-` / `HttpOnly` / `SameSite=Lax` (Strict where possible) |

Admin app uses the same identity provider with **stricter role gates** (`PLATFORM_*` roles).

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
| HTTP headers | CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| CORS | Restrict to known brand domains + app URLs |

Server Actions are treated as public endpoints — same validation and authz as REST.

---

## Rate limiting

Redis sliding window (`@mysimcha/shared` / middleware):

| Surface | Default budget |
|---------|----------------|
| Auth endpoints | Low (e.g. 10 / 15 min / IP) |
| Public RSVP | Moderate per event + IP |
| Authenticated API | 100 / min / user |
| Webhooks | Signature verify; high but idempotent |
| AI endpoints | Strict per org plan entitlement |

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

- Vitest policy unit tests for RBAC matrix
- Playwright tests ensuring unauthorized routes redirect
- Periodic dependency scanning in CI
- Sentry for anomaly breadcrumbs (no secrets)

---

*Prev: [03 — Database](./03-database.md) · Next: [05 — API](./05-api.md)*
