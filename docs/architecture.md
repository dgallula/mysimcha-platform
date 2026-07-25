# Architecture — MySimcha Platform

## Purpose

Define the production-grade technical architecture for a **scalable multi-brand SaaS** that powers premium digital emotional invitations.

**Current phase:** bootable Next.js app shells.  
Application business features are **not** implemented yet.

## Quality bar

Architecture should support years of development at the rigor of platforms like Vercel, Stripe, Linear, Canva, and Framer.

Priorities: scalability → security → maintainability → DX → performance → SEO → clean architecture.

---

## Technology stack

### Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui (via `@mysimcha/ui`)
- Framer Motion / GSAP / Lottie (motion layer — later)

### Backend

- Next.js Server Actions / API Routes
- Node.js
- Prisma ORM

### Data & cache

- PostgreSQL (system of record)
- Redis (sessions, rate limits, hot brand config, queues)

### Integrations

| Concern | Provider | Package |
|---------|----------|---------|
| Auth | Auth.js | `@mysimcha/auth` |
| Media | Cloudinary | `@mysimcha/media` |
| Payments | Stripe | `@mysimcha/payments` |
| Email | Resend | `@mysimcha/emails` |
| SMS / WhatsApp | Twilio | `@mysimcha/notifications` |
| Maps | Google Maps | `@mysimcha/maps` |
| AI | OpenAI | `@mysimcha/ai` |
| Monitoring | Sentry | apps + shared instrumentation |
| Analytics | PostHog | `@mysimcha/analytics` |

### Delivery

- Docker / Docker Compose (local Postgres + Redis)
- Vercel (Next.js apps)
- GitHub Actions (CI)
- Playwright + Vitest (testing)

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
│   ├── web/                 # Customer app + guest invitation runtime
│   ├── admin/               # Platform administration
│   ├── landing/             # Multi-brand marketing
│   └── docs/                # Technical documentation site
├── packages/
│   ├── ui/                  # Design system
│   ├── database/            # Prisma + PostgreSQL access
│   ├── auth/                # Authentication + RBAC
│   ├── payments/            # Stripe
│   ├── emails/              # Email templates + Resend
│   ├── notifications/       # Twilio SMS / WhatsApp / push
│   ├── media/               # Cloudinary
│   ├── ai/                  # OpenAI gateway
│   ├── maps/                # Google Maps
│   ├── analytics/           # PostHog wrappers
│   ├── branding/            # Brand / theme / domain engine
│   ├── shared/              # Shared utils + Zod
│   └── config/              # Shared config / Tailwind preset / env schema
├── tooling/
│   └── typescript/          # Shared tsconfig bases
├── env/                     # Environment templates by stage
├── docs/                    # Architecture source of truth
├── docker/                  # Container assets
├── eslint.config.mjs
├── .prettierrc.json
├── .env.example
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

---

## Folder responsibilities

### `apps/`

| Folder | Responsibility | Must not |
|--------|----------------|----------|
| `apps/web` | Customer product + public guest invitation experiences | Own Stripe/Prisma/Cloudinary clients; fork per brand |
| `apps/admin` | Platform ops, support, elevated RBAC | Be indexed by search engines; bypass audit logging |
| `apps/landing` | Multi-domain marketing / SEO acquisition | Contain authenticated product logic |
| `apps/docs` | Human-facing technical docs site | Replace `/docs` markdown as source of truth |

Apps are **composition roots**: routing, layouts, and wiring packages together.

**Current app status:** `web`, `admin`, `landing` (and `docs`) have minimal App Router shells (`layout`, `page`, `/api/health`) so `pnpm dev` / `pnpm build` / `pnpm typecheck` work. No authentication, database access, or business features yet.
### `packages/`

| Package | Responsibility |
|---------|----------------|
| `@mysimcha/ui` | Shared design-system primitives and tokens hooks |
| `@mysimcha/database` | Prisma schema, client singleton, tenant helpers |
| `@mysimcha/auth` | Auth.js surface + RBAC enforcement helpers |
| `@mysimcha/payments` | Stripe contracts and future SDK wrapper |
| `@mysimcha/emails` | Email template registry + Resend boundary |
| `@mysimcha/notifications` | SMS / WhatsApp / push (Twilio) boundary |
| `@mysimcha/media` | Cloudinary upload/transform contracts |
| `@mysimcha/ai` | OpenAI / provider-agnostic AI gateway contracts |
| `@mysimcha/maps` | Google Maps helpers |
| `@mysimcha/analytics` | PostHog tracking vocabulary |
| `@mysimcha/branding` | Domain → brand → theme → locale resolution |
| `@mysimcha/shared` | Result types, IDs, permissions vocabulary, Zod-ready utils |
| `@mysimcha/config` | Env schema, Tailwind preset, shared tooling config |

### `tooling/`

Shared TypeScript configuration packages consumed by apps and libraries (`@mysimcha/tsconfig`).

### `env/`

Environment templates for development, staging, and production. Full catalog also in root `.env.example`.

### `docs/`

Architecture and product documentation — **source of truth** for agents and humans.

### `docker/`

Container definitions and local data volume placeholders.

---

## Dependency rules

These rules are mandatory. Violations are architecture bugs.

### Direction

```text
apps/*  →  packages/*  →  @mysimcha/shared | @mysimcha/config | @mysimcha/tsconfig
                │
                └── @mysimcha/database (data access only)
```

1. **Apps may depend on packages.** Packages must **never** depend on apps.
2. **No circular package dependencies.** Prefer depending inward on `shared` / `config` / `database`.
3. **Provider isolation**
   - Prisma → `@mysimcha/database` only  
   - Stripe → `@mysimcha/payments` only  
   - Cloudinary → `@mysimcha/media` only  
   - Twilio → `@mysimcha/notifications` only  
   - OpenAI → `@mysimcha/ai` only  
   - Google Maps → `@mysimcha/maps` only  
4. **UI primitives** live in `@mysimcha/ui`. Product compositions live in apps (when pages exist).
5. **Tenant scope:** any organization data access must include `organizationId`.
6. **Validation:** Zod at every Server Action / Route Handler boundary (via `@mysimcha/shared` schemas).
7. **Workspace protocol only:** `"@mysimcha/foo": "workspace:*"` — no relative imports across package roots.
8. **Brand differences** are configuration (`branding` + DB themes/templates), never new apps or forks.

### Allowed dependency examples

| From | To | OK? |
|------|----|-----|
| `apps/web` | `@mysimcha/auth` | Yes |
| `apps/web` | `@prisma/client` | No — use `@mysimcha/database` |
| `@mysimcha/payments` | `stripe` | Yes |
| `@mysimcha/payments` | `@mysimcha/web` | No |
| `@mysimcha/auth` | `@mysimcha/shared` | Yes |
| `@mysimcha/ui` | `@mysimcha/database` | No |

---

## Development workflow

### One-time setup

```bash
cp .env.example .env
pnpm install
docker compose up -d          # PostgreSQL + Redis
pnpm db:generate              # when schema work begins
```

### Day-to-day

```bash
pnpm dev                      # turbo dev across apps that define it
pnpm --filter=@mysimcha/web dev
pnpm lint
pnpm typecheck
pnpm test
pnpm format
```

### Ports (planned)

| App | Port |
|-----|------|
| web | 3000 |
| admin | 3001 |
| landing | 3002 |
| docs | 3003 |

### Turborepo

- `turbo.json` defines `dev`, `build`, `lint`, `typecheck`, `test`, and database tasks.
- Package tasks run with dependency awareness (`dependsOn: ["^…"]`).
- Remote cache (Vercel) is recommended once CI is stable.

### pnpm workspaces

- `pnpm-workspace.yaml` includes `apps/*`, `packages/*`, `tooling/*`.
- Use `pnpm --filter=@mysimcha/<name> <script>` for scoped work.
- Lockfile (`pnpm-lock.yaml`) is the single install source of truth.

### Environment

1. Root `.env.example` = full catalog  
2. `env/.env.*.example` = per-stage checklists  
3. Secrets never committed  
4. Future: Vercel env per app + GitHub Actions secrets  

### Quality gates

| Gate | Command / tool |
|------|----------------|
| Lint | ESLint (`eslint.config.mjs`) |
| Format | Prettier |
| Types | `tsc --noEmit` per package/app |
| Unit | Vitest (packages) |
| E2E | Playwright (when pages exist) |
| Schema | `prisma validate` / migrate |

### Git

- Protect `main`
- Branch as `feat/*`, `fix/*`, `chore/*`, `docs/*`
- CI runs install → lint/typecheck/test → Prisma validate

---

## Why four apps

| App | Responsibility | Notes |
|-----|----------------|-------|
| `landing` | Acquisition, brand storytelling | Aggressive SEO / ISR, multi-domain |
| `web` | Authenticated product + public guest pages | Mixed caching; invitation runtime |
| `admin` | Privileged operations | Noindex, strict RBAC |
| `docs` | Engineering docs | Static docs site |

Separating deploy cadence and caching policies keeps marketing, product, and admin safe from each other.

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
 │ multi-brand │             │ product +   │             │ platform    │
 │ marketing   │             │ guest sites │             │ ops         │
 └──────┬──────┘             └──────┬──────┘             └──────┬──────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                 ┌──────────────────▼──────────────────┐
                 │     Shared domain packages           │
                 │ auth payments media ai emails maps   │
                 │ notifications branding analytics …   │
                 └──────────────────┬──────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
       ┌──────▼──────┐       ┌──────▼──────┐       ┌──────▼──────┐
       │ PostgreSQL  │       │    Redis    │       │ Cloudinary  │
       └─────────────┘       └─────────────┘       └─────────────┘

 Stripe · Twilio · Resend · OpenAI · Google Maps · Sentry · PostHog
```

---

## Multi-brand architecture

### Resolution inputs

- `Host` / domain  
- Explicit brand slug (preview / admin)  
- Public invitation / event path  

### Resolution outputs (`BrandContext`)

- `brandId` / `brandSlug`  
- display name, domains, locales  
- theme id + design tokens  
- asset base URL, template set, feature flags  

Brands are **data + configuration**, not repositories.

---

## Multi-tenancy

**Model:** shared PostgreSQL database and schema; **row-level isolation** via `organizationId`.

| Layer | Mechanism |
|-------|-----------|
| Schema | Tenant tables include `organizationId` |
| Application | Repository helpers require tenant scope |
| Authorization | Membership + RBAC before mutation |
| Platform ops | `apps/admin` with elevated roles + audit logs |

**Brand vs tenant**

- **Organization** = paying customer (tenant)  
- **Brand** = product line / site skin  
- **Event / invitation** belongs to an organization and renders under a brand  

---

## Security, SEO, observability (foundation)

- RBAC + Zod validation + rate limiting + audit logs + Sentry  
- Brand-aware metadata, sitemap, robots, Open Graph, Schema.org (when pages exist)  
- PostHog for product analytics  

---

## MCP integrations (developer machines)

GitHub, Filesystem, Terminal, Docker, PostgreSQL, Prisma, Figma, Playwright, Browser, Stripe, Twilio, Resend, Google Maps, Vercel, Sentry, OpenAI, Claude.

MCP assists development; **runtime product traffic** uses `@mysimcha/*` packages.

---

## Scalability path

1. **Now:** monorepo foundation + Vercel apps + managed Postgres/Redis + Cloudinary  
2. **Next:** pooling, ISR/tag revalidation for invitation traffic, read replicas  
3. **Later:** workers for media/AI, optional RLS — extract services only when package boundaries demand it  

---

## Decision summary

| Decision | Choice | Why |
|----------|--------|-----|
| Monorepo | Turborepo + pnpm | Shared code, fast filtered builds |
| Apps | Next.js 15 × 4 | SSR/SEO + Server Actions |
| UI runtime | React 19 + TypeScript | Modern, typed, maintainable |
| ORM / DB | Prisma + PostgreSQL | Integrity for tenancy, RSVP, billing |
| Media | Cloudinary | Transforms + CDN |
| Payments | Stripe | Subscriptions + webhooks |
| Messaging | Twilio | SMS / WhatsApp |
| AI | OpenAI via `@mysimcha/ai` | One AI engine for all brands |
| Maps | Google Maps | Venue accuracy |
| Monitoring | Sentry | Production error visibility |

---

## Phase status

| Item | Status |
|------|--------|
| Documentation | Done (canonical `/docs`) |
| Monorepo tooling (pnpm, turbo, TS, ESLint, Prettier) | Done |
| App / package shells | Done |
| Minimal App Router boot (`web` / `admin` / `landing`) | Done |
| Initial Prisma migration (`20260724000000_init`) | Done (apply when Postgres is up) |
| Schema integrity FKs (`AnalyticsEvent` org, `Setting` user) | Done (`20260724010000_…`) |
| Authentication / database wiring in apps | **Not started** |
| Business features | **Not started** |

---

See also: [Product Vision](./product-vision.md) · [Database](./database.md) · [Security](./security.md) · [API](./api.md) · [Development Guide](./development-guide.md)
