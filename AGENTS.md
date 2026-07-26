# AGENTS.md — MySimcha Platform

Instructions for AI coding agents working in this repository.

## Mission

Build and maintain a **production-grade, multi-brand SaaS** for premium digital emotional invitations.

**Platform:** MySimcha  
**First product:** MyBatMitzvah  
**Future products:** MyBarMitzvah, MyWedding, MyBritMilah, MyBirthday, MyEngagement, Corporate Events

All products share one codebase, backend, database, auth, payments, AI engine, and media system. Only branding, templates, and content change.

## Current phase

**Sprint 1 completed** — identity & multi-tenant.  
**Sprint 2 completed** — auth rate limiting via `RateLimiter` + `MemoryRateLimiter` (no Redis).  
Do **not** implement invitations, events, or other business features unless explicitly asked.

## Read first

1. [docs/product-vision.md](./docs/product-vision.md)
2. [docs/architecture.md](./docs/architecture.md)
3. [docs/database.md](./docs/database.md)
4. [docs/security.md](./docs/security.md)
5. [docs/api.md](./docs/api.md)
6. [docs/development-guide.md](./docs/development-guide.md)
7. This file (`AGENTS.md`)
8. [CLAUDE.md](./CLAUDE.md)

> **Canonical docs only.** Ignore `docs/archive/` (historical numbered drafts).

## Hard rules

1. **One codebase** for all brands — no per-brand app forks.
2. **Multi-tenant by organization** — every customer query must include `organizationId`.
3. **Prisma only** inside `@mysimcha/database`.
4. **Stripe only** inside `@mysimcha/payments`.
5. **Cloudinary only** inside `@mysimcha/media`.
6. **Twilio / messaging** only inside `@mysimcha/notifications` (and email via `@mysimcha/emails`).
7. **OpenAI / AI** only inside `@mysimcha/ai`.
8. **Google Maps** only inside `@mysimcha/maps`.
9. **Validate** all external inputs with Zod (`@mysimcha/shared`).
10. **AuthZ** via `@mysimcha/auth` — never trust client-sent roles.
11. Prefer **Server Components**; Client Components only for interactivity.
12. Do not commit secrets; use `.env.example` as the contract.
13. Update `/docs` when architectural boundaries change.

## Target quality

Comparable to Vercel, Stripe, Linear, Canva, Framer:

1. Scalability  
2. Security  
3. Maintainability  
4. Developer experience  
5. Performance  
6. SEO  
7. Clean architecture  

## Monorepo map (planned)

| Path | Role |
|------|------|
| `apps/web` | Customer product + guest invitation experiences |
| `apps/admin` | Platform administration |
| `apps/landing` | Multi-domain marketing sites |
| `apps/docs` | Technical documentation site |
| `packages/ui` | Shared design system |
| `packages/database` | Prisma schema + PostgreSQL access |
| `packages/auth` | Authentication + RBAC |
| `packages/payments` | Stripe |
| `packages/emails` | Transactional email |
| `packages/notifications` | SMS / WhatsApp / push (Twilio) |
| `packages/media` | Cloudinary media |
| `packages/ai` | OpenAI / AI services |
| `packages/maps` | Google Maps |
| `packages/analytics` | Product analytics |
| `packages/branding` | Domain → brand → theme → locale |
| `packages/shared` | Shared utilities + Zod schemas |
| `packages/config` | Global configuration |

## Branding engine

Resolve from host/domain (and preview overrides):

- brand  
- theme  
- templates  
- colors / tokens  
- assets  
- language  

Example: Brand `MyBatMitzvah` + Theme `Luxury Gold` + Language `French`.

## Security checklist (every mutation)

- [ ] Session authenticated (or public invitation token verified)
- [ ] Membership loaded for `organizationId`
- [ ] Permission asserted
- [ ] Input Zod-parsed
- [ ] Audit-sensitive actions considered
- [ ] Errors reported to Sentry without leaking secrets/PII

## UX checklist (customer-facing)

- Luxury, elegant, emotional, modern
- Brand-first marketing and guest surfaces
- Accessibility + `prefers-reduced-motion`

## MCP (developer tooling)

Expect integrations for GitHub, filesystem, terminal, Docker, PostgreSQL, Prisma, Figma, Playwright, browser, Stripe, Twilio, Resend, Google Maps, Vercel, Sentry, OpenAI, and Claude. Product runtime still goes through platform packages — MCP does not replace package boundaries.

## When unsure

Document the decision in `/docs`, keep package boundaries intact, and ask for human approval on auth, tenancy, or billing changes.
