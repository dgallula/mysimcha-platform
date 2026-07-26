# Architecture — MySimcha Platform

## Purpose

Define the production-grade technical architecture for a **scalable multi-brand SaaS** that powers premium digital emotional invitations.

**Current phase:** Sprint 1 completed; Sprint 2 auth rate limiting (**MemoryRateLimiter**, no Redis) completed.  
**Next:** further work only when explicitly approved. Invitations, events, and other business features are **not** implemented.

## Quality bar

Architecture should support years of development at the rigor of platforms like Vercel, Stripe, Linear, Canva, and Framer.

Priorities: scalability → security → maintainability → DX → performance → SEO → clean architecture.

---

## Technology stack

### Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS + shadcn/ui via `@mysimcha/ui` (**planned**; web currently uses minimal inline styles)
- Framer Motion / GSAP / Lottie (motion layer — later)

### Backend

- Next.js Server Actions / API Routes
- Node.js
- Prisma ORM
- Auth.js (NextAuth v5) via `@mysimcha/auth`

### Data & cache

- PostgreSQL (system of record)
- Redis (Compose available for local optional use; **not required in Sprint 2**). Rate limiting uses in-memory `MemoryRateLimiter` behind a `RateLimiter` interface. Redis may plug in later without changing callers. Sprint 1+ sessions remain **JWT**.

### Integrations (packages exist; SDKs mostly not wired yet)

| Concern | Provider | Package | Sprint 1 |
|---------|----------|---------|----------|
| Auth | Auth.js | `@mysimcha/auth` | **Done** (credentials + JWT) |
| Media | Cloudinary | `@mysimcha/media` | Contract stub |
| Payments | Stripe | `@mysimcha/payments` | Contract stub |
| Email | Resend | `@mysimcha/emails` | Contract stub |
| SMS / WhatsApp | Twilio | `@mysimcha/notifications` | Contract stub |
| Maps | Google Maps | `@mysimcha/maps` | Contract stub |
| AI | OpenAI | `@mysimcha/ai` | Contract stub |
| Monitoring | Sentry | apps + shared | Env only |
| Analytics | PostHog | `@mysimcha/analytics` | Contract stub |

### Delivery

- Docker / Docker Compose (local Postgres + Redis)
- Vercel (Next.js apps) — planned deploy target
- GitHub Actions CI (install → Prisma validate/generate → lint → typecheck → test → build)
- Vitest (unit). Playwright when guest/product pages exist.

### Monorepo tooling

- **pnpm** workspaces
- **Turborepo** task orchestration
- Shared TypeScript configs (`tooling/typescript`)
- ESLint flat config (`eslint.config.mjs`)
- Prettier (`.prettierrc.json`)

---

## Monorepo structure

```text
mysimcha-platform/
├── apps/
│   ├── web/                 # Customer app (Sprint 1 auth + dashboard)
│   ├── admin/               # Platform administration (shell)
│   ├── landing/             # Multi-brand marketing (shell)
│   └── docs/                # Technical documentation site (shell)
├── packages/
│   ├── ui/                  # Design system (minimal Button)
│   ├── database/            # Prisma + PostgreSQL access
│   ├── auth/                # Authentication + RBAC
│   ├── payments/            # Stripe (contract)
│   ├── emails/              # Email (contract)
│   ├── notifications/       # Twilio (contract)
│   ├── media/               # Cloudinary (contract)
│   ├── ai/                  # OpenAI (contract)
│   ├── maps/                # Google Maps (contract)
│   ├── analytics/           # PostHog (contract)
│   ├── branding/            # Static brand registry (+ future DB resolve)
│   ├── shared/              # Shared utils + Zod
│   └── config/              # Env schema / Tailwind preset
├── tooling/
│   └── typescript/
├── env/
├── docs/
├── docker/
├── .github/workflows/ci.yml
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

---

## Folder responsibilities

### `apps/`

| Folder | Responsibility | Must not |
|--------|----------------|----------|
| `apps/web` | Customer product + (future) guest invitation experiences | Own Stripe/Prisma/Cloudinary clients; fork per brand |
| `apps/admin` | Platform ops, support, elevated RBAC | Be indexed by search engines; bypass audit logging |
| `apps/landing` | Multi-domain marketing / SEO acquisition | Contain authenticated product logic |
| `apps/docs` | Human-facing technical docs site | Replace `/docs` markdown as source of truth |

Apps are **composition roots**: routing, layouts, and wiring packages together.

**Current app status**

| App | Status |
|-----|--------|
| `web` | Sprint 1: `/login`, `/register`, `/dashboard`, `/api/auth/*`, `/api/health`; uses `@mysimcha/auth` + `@mysimcha/database` |
| `admin` | Shell: home + `/api/health` (no auth yet) |
| `landing` | Shell: home + `/api/health` |
| `docs` | Shell: home + `/api/health` |

### `packages/`

| Package | Responsibility | Status |
|---------|----------------|--------|
| `@mysimcha/database` | Prisma schema, client, tenant helpers, user/org accessors, seed | **Sprint 1 done** |
| `@mysimcha/auth` | Auth.js + password hashing + RBAC helpers | **Sprint 1 done** |
| `@mysimcha/shared` | Result types, IDs, permissions, auth Zod schemas | **Sprint 1 done** |
| `@mysimcha/branding` | Domain → brand → theme registry | Partial (static registry) |
| `@mysimcha/ui` | Design-system primitives | Minimal (Button) |
| `@mysimcha/config` | Env schema, Tailwind preset | Partial |
| `@mysimcha/payments` / `emails` / `notifications` / `media` / `ai` / `maps` / `analytics` | Provider boundaries | Contract stubs |

### `tooling/` / `env/` / `docs/` / `docker/`

Unchanged roles: shared tsconfig, env templates, architecture source of truth, Compose assets.

---

## Dependency rules

These rules are mandatory. Violations are architecture bugs.

### Direction

```text
apps/web  →  @mysimcha/auth  →  @mysimcha/database  →  @mysimcha/shared
                │
apps/*    →  packages/*  →  @mysimcha/shared | @mysimcha/config | @mysimcha/tsconfig
```

1. **Apps may depend on packages.** Packages must **never** depend on apps.
2. **No circular package dependencies.**
3. **Provider isolation** — Prisma only in `database`; Stripe only in `payments`; Cloudinary only in `media`; Twilio only in `notifications`; OpenAI only in `ai`; Maps only in `maps`.
4. **UI primitives** live in `@mysimcha/ui`. Product compositions live in apps.
5. **Tenant scope:** organization data access must include `organizationId`.
6. **Validation:** Zod at Server Action / Route Handler boundaries.
7. **Workspace protocol only:** `"@mysimcha/foo": "workspace:*"`.
8. **Brand differences** are configuration, never new apps or forks.

### Allowed dependency examples

| From | To | OK? |
|------|----|-----|
| `apps/web` | `@mysimcha/auth` | Yes |
| `apps/web` | `@prisma/client` | No — use `@mysimcha/database` |
| `@mysimcha/payments` | `stripe` | Yes |
| `@mysimcha/payments` | `@mysimcha/web` | No |
| `@mysimcha/auth` | `@mysimcha/database` | Yes |
| `@mysimcha/ui` | `@mysimcha/database` | No |

---

## Development workflow

### One-time setup

```bash
cp .env.example .env          # set AUTH_SECRET
pnpm install
docker compose up -d          # PostgreSQL + Redis
pnpm db:generate
pnpm db:deploy
pnpm db:seed
```

### Day-to-day

```bash
pnpm --filter=@mysimcha/web dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### Ports

| App | Port |
|-----|------|
| web | 3000 |
| admin | 3001 |
| landing | 3002 |
| docs | 3003 |

### Quality gates

| Gate | Tool |
|------|------|
| Lint | ESLint |
| Format | Prettier |
| Types | `tsc --noEmit` |
| Unit | Vitest (`shared`, `auth`, `database`) |
| Schema | `prisma validate` / generate / migrate |
| E2E | Playwright (not yet) |

### Git / CI

- Protect `main`; branches `feat/*`, `fix/*`, `chore/*`, `docs/*`
- CI: install → Prisma validate/generate → lint → typecheck → test → build

---

## Why four apps

| App | Responsibility | Notes |
|-----|----------------|-------|
| `landing` | Acquisition, brand storytelling | SEO / ISR, multi-domain (future) |
| `web` | Authenticated product + public guest pages | Sprint 1 auth live |
| `admin` | Privileged operations | Noindex; auth not wired yet |
| `docs` | Engineering docs site | Shell; `/docs` markdown is source of truth |

---

## High-level system diagram

```text
                 ┌──────────────────────────────────────┐
                 │         Edge / CDN (Vercel)          │
                 └──────────────────┬───────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
 ┌──────▼──────┐             ┌──────▼──────┐             ┌──────▼──────┐
 │ apps/landing│             │  apps/web   │             │ apps/admin  │
 │ shell       │             │ auth+dash   │             │ shell       │
 │ (future SEO)│             │ (Sprint 1)  │             │ (future)    │
 └──────┬──────┘             └──────┬──────┘             └──────┬──────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                 ┌──────────────────▼──────────────────┐
                 │  Shared packages (auth/database     │
                 │  live; payments/media/… stubs)      │
                 └──────────────────┬──────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
       ┌──────▼──────┐       ┌──────▼──────┐       ┌──────▼──────┐
       │ PostgreSQL  │       │    Redis    │       │ Cloudinary  │
       │ (in use)    │       │ (Compose;   │       │ (not wired) │
       │             │       │  unused S1) │       │             │
       └─────────────┘       └─────────────┘       └─────────────┘
```

---

## Multi-brand architecture

### Resolution inputs

- `Host` / domain  
- Explicit brand slug (preview / admin)  
- Public invitation / event path  

### Resolution outputs (`BrandContext`)

- `brandId` / `brandSlug`, locales, theme tokens, asset base URL, feature flags  

Brands are **data + configuration**, not repositories.  
**Sprint 1:** static registry in `@mysimcha/branding` exists; **not** wired into app middleware yet.

---

## Multi-tenancy

**Model:** shared PostgreSQL database and schema; isolation via `organizationId`.

| Layer | Mechanism |
|-------|-----------|
| Schema | Tenant tables include `organizationId` |
| Application | `@mysimcha/database` helpers + membership checks |
| Authorization | `@mysimcha/auth` RBAC (`requireMembership` / `assertPermission`) |
| Platform ops | `apps/admin` later (`PLATFORM_*` roles) |

**Brand vs tenant**

- **Organization** = paying customer (tenant)  
- **Brand** = product line / site skin  
- **Event / invitation** (future) belongs to an organization and renders under a brand  

**Sprint 1 registration:** creates `User` + `Organization` + `Membership(OWNER)`; active org = first membership.

---

## Security, SEO, observability

| Area | Sprint 1 reality |
|------|------------------|
| Authn | Credentials + JWT in `@mysimcha/auth` |
| Authz | Org RBAC helpers; platform admin UI not built |
| Rate limiting | `RateLimiter` + `MemoryRateLimiter` on login/register (Redis later) |
| Security headers | Documented; **not in Next config yet** |
| SEO (OG, sitemap, Schema.org) | Not implemented (web/admin noindex) |
| Sentry / PostHog | Env placeholders only |

---

## MCP integrations (developer machines)

Recommended local MCP servers are listed in the [Development Guide](./development-guide.md).  
Example config: `.cursor/mcp.json.example` (subset). MCP is optional DX — **runtime** uses `@mysimcha/*` packages.

---

## Scalability path

1. **Now:** monorepo + Sprint 1 auth/tenancy + managed Postgres  
2. **Next:** branding middleware, invitation traffic patterns, optional RedisRateLimiter  
3. **Later:** workers, optional RLS — extract services only when package boundaries demand it  

---

## Decision summary

| Decision | Choice | Why |
|----------|--------|-----|
| Monorepo | Turborepo + pnpm | Shared code, fast filtered builds |
| Apps | Next.js 15 × 4 | SSR/SEO + Server Actions |
| Auth (Sprint 1) | Auth.js Credentials + JWT | Auth.js requires JWT for credentials |
| ORM / DB | Prisma + PostgreSQL | Integrity for tenancy, RSVP, billing |
| Media / payments / messaging / AI | Cloudinary / Stripe / Twilio / OpenAI | Via dedicated packages when implemented |

---

## Implementation status

| Item | Status |
|------|--------|
| Documentation (canonical `/docs`) | Done |
| Monorepo tooling (pnpm, turbo, TS, ESLint, Prettier) | Done |
| App shells (`admin` / `landing` / `docs`) | Done |
| Prisma baseline + integrity FKs | Done (`20260724000000_init`, `20260724010000_…`) |
| User `passwordHash` migration | Done (`20260725000000_add_user_password_hash`) |
| GitHub Actions CI | Done |
| **Sprint 1 — Auth.js credentials, orgs, memberships, web dashboard** | **Completed** |
| **Sprint 2 — Auth rate limiting (`RateLimiter` + `MemoryRateLimiter`)** | **Completed** (no Redis) |
| Branding middleware / multi-domain landing | Not started |
| Invitations / events / RSVP | Not started |
| Stripe / Twilio / Cloudinary / OpenAI wiring | Not started |
| Admin platform auth UI | Not started |
| Redis adapter / Sentry / PostHog | Not started |

---

See also: [Product Vision](./product-vision.md) · [Database](./database.md) · [Security](./security.md) · [API](./api.md) · [Development Guide](./development-guide.md)
