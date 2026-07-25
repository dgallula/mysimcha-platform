# 02 — System Architecture

## Decision summary

| Decision | Choice | Why |
|----------|--------|-----|
| Monorepo | Turborepo + pnpm | Shared packages, fast filtered builds, industry-standard DX |
| Apps | Next.js 15 (App Router) × 4 | SSR/SSG/ISR, Server Actions, edge-ready SEO |
| Language | TypeScript strict | Maintainability at scale |
| ORM | Prisma | Typed schema, migrations, excellent PostgreSQL support |
| DB | PostgreSQL | Relational integrity for tenancy, billing, RSVP |
| Cache | Redis | Sessions, rate limits, hot brand config, queues |
| Auth | Auth.js (Auth.js / NextAuth v5) | First-party Next.js fit, portable, no vendor lock for core identity |
| Storage | Cloudinary | Media transforms, video, CDN — event media is core |
| Payments | Stripe | Subscriptions + invoices + webhooks maturity |
| Deploy apps | Vercel | Next.js-native, preview envs, edge network |
| Containers | Docker Compose (local) + Docker images (CI/workers) | Parity for Postgres/Redis; future workers |
| UI | Tailwind + shadcn/ui + Motion/GSAP/Lottie | Premium motion without abandoning system consistency |

**Auth note:** Clerk remains an approved alternative if product wants hosted UIs faster; the `@mysimcha/auth` package abstracts provider so swap cost stays localized. Foundation defaults to **Auth.js**.

**Storage note:** Supabase Storage is a valid alternative; Cloudinary is preferred for transform-heavy invitation media.

---

## High-level diagram

```text
                    ┌─────────────────────────────────────────┐
                    │              Edge / CDN (Vercel)         │
                    └───────────────┬─────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
   ┌──────▼──────┐           ┌──────▼──────┐           ┌──────▼──────┐
   │ apps/landing│           │  apps/web   │           │ apps/admin  │
   │ marketing   │           │ customer +  │           │ platform    │
   │ multi-domain│           │ guest sites │           │ ops         │
   └──────┬──────┘           └──────┬──────┘           └──────┬──────┘
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │     Shared domain packages     │
                    │ auth payments media ai emails  │
                    │ notifications branding maps …  │
                    └───────────────┬───────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
       ┌──────▼──────┐       ┌──────▼──────┐       ┌──────▼──────┐
       │ PostgreSQL  │       │    Redis    │       │ Cloudinary  │
       └─────────────┘       └─────────────┘       └─────────────┘
              │
       Stripe │ Resend │ Twilio │ Sentry │ PostHog │ Maps │ AI APIs
```

---

## Monorepo layout

```text
mysimcha-platform/
├── apps/
│   ├── web/          # Customer app + public event experiences
│   ├── admin/        # Internal platform administration
│   ├── landing/      # Multi-brand marketing sites
│   └── docs/         # Technical docs site (Nextra or Fumadocs)
├── packages/
│   ├── ui/           # Design system (shadcn-based)
│   ├── database/     # Prisma schema, client, tenancy helpers
│   ├── auth/         # Auth.js config, session, RBAC helpers
│   ├── payments/     # Stripe clients, webhook types, entitlements
│   ├── emails/       # Resend + React Email templates
│   ├── notifications/# SMS / WhatsApp / push abstractions
│   ├── media/        # Cloudinary uploads & transforms
│   ├── ai/           # Provider-agnostic AI gateway
│   ├── maps/         # Google Maps server/client helpers
│   ├── analytics/    # PostHog wrappers
│   ├── branding/     # Brand/theme/domain resolution engine
│   ├── shared/       # Zod schemas, result types, utils
│   └── config/       # ESLint, Tailwind presets, env schema
├── tooling/typescript/
├── docs/             # Architecture markdown (source of truth)
├── docker/
├── .github/workflows/
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

### Why four apps (not one)

| App | Responsibility | Caching / SEO profile |
|-----|----------------|------------------------|
| `landing` | Acquisition, brand storytelling | Aggressive static/ISR, multi-domain |
| `web` | Authenticated product + guest event runtime | Mixed: static shells + dynamic event data |
| `admin` | Privileged ops | Noindex, strict authz, separate deploy |
| `docs` | Engineering docs | Static, public or SSO later |

Separating blast radius, deploy cadence, and caching policies is how large SaaS teams stay fast without coupling marketing deploys to admin releases.

---

## Request lifecycle (brand-aware)

1. Request hits Vercel with `Host` header (`mybatmitzvah.com`, preview URL, localhost).
2. Middleware in the relevant app calls `@mysimcha/branding` → resolves `BrandContext`.
3. `BrandContext` supplies: brand id, theme tokens, default locale, asset URLs, feature flags.
4. Server Components / Server Actions receive `organizationId` + `brandId` from session or public event slug.
5. Data access goes through `@mysimcha/database` helpers that **require** tenant scope.
6. Mutations emit audit events and optional analytics; side effects go to Resend/Twilio/Stripe/AI via packages.

---

## Clean architecture layers

```text
apps/*                 → Presentation (UI, routing, middleware)
packages/* (domain)    → Application services / ports
packages/database      → Infrastructure (Prisma)
packages/shared        → Enterprise-wide types & validation
```

Rules:

- Apps may depend on packages; packages must **not** depend on apps.
- Domain packages depend inward on `shared` / `config` / `database` only as needed.
- No Prisma imports outside `@mysimcha/database` (except generated types re-exported).
- No Stripe SDK outside `@mysimcha/payments`.
- UI primitives live in `@mysimcha/ui`; product compositions live in apps.

---

## Multi-brand architecture

See also branding package contracts.

### Resolution inputs

- Domain / host
- Explicit brand slug (admin / preview)
- Event public path (`/e/[eventSlug]`) for guest runtime

### Resolution outputs (`BrandContext`)

```ts
{
  brandId: string;
  brandSlug: "mybatmitzvah" | "mybarmitzvah" | "mywedding" | ...;
  displayName: string;
  domains: string[];
  defaultLocale: string;
  supportedLocales: string[];
  themeId: string;
  themeTokens: DesignTokens;
  assetBaseUrl: string;
  templateSetId: string;
  stripePriceMap: Record<string, string>;
  featureFlags: Record<string, boolean>;
}
```

Example: Brand `MyBatMitzvah` + Theme `Luxury Gold` + Language `French` → French marketing copy, gold token set, Bat Mitzvah template catalog, `mybatmitzvah.com` SEO entity.

Brands are **data + config**, not code forks. Code may include brand-safe conditionals only for legal/compliance exceptions — prefer config.

---

## Multi-tenancy strategy

**Model:** Shared database, shared schema, **row-level tenant isolation** by `organizationId`.

| Layer | Mechanism |
|-------|-----------|
| Schema | Every tenant table has `organizationId` (UUID FK) |
| Application | Repository helpers require `organizationId` |
| AuthZ | RBAC + membership check before mutation |
| Defense in depth | Optional Postgres Row Level Security in later phase |
| Platform ops | `apps/admin` uses elevated roles with audit logging |

**Why not DB-per-tenant:** Operational cost explodes at millions of orgs; shared schema with strict scoping matches Linear/Vercel-class SaaS.

**Brand vs tenant:** An Organization is the paying customer. A Brand is a product line / site skin. Events belong to an Organization and are rendered under a Brand.

---

## Caching strategy

| Data | Store | TTL / invalidation |
|------|-------|--------------------|
| Brand config | Redis | Long TTL + pub/sub invalidate on admin change |
| Session | Redis / JWT per Auth.js strategy | Session lifetime |
| Rate limits | Redis sliding window | Window ms |
| Event public page | Next.js ISR / `revalidateTag` | On publish / update |
| Media | Cloudinary CDN | Immutable URLs with transforms |

---

## Async & side effects (foundation)

Foundation prepares for workers without implementing them:

- Stripe webhooks → idempotent handlers in `apps/web` API routes (initial) → later extract to worker.
- Email/SMS → queue interface in `@mysimcha/notifications` (Redis-backed later).
- AI generation → async job contract in `@mysimcha/ai`.

---

## Observability

- **Sentry** — errors, performance traces per app.
- **PostHog** — product analytics, feature flags (client + server).
- Structured logs with `requestId`, `organizationId`, `brandId` (never PII in clear logs beyond necessity).

---

## Testing strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | packages pure logic |
| Component | Vitest + Testing Library | `@mysimcha/ui` |
| E2E | Playwright | critical auth, billing webhook, public event render |
| Contract | Zod | env + API payloads |

---

## Scalability path

1. **Now:** Vercel serverless/Node for apps; managed Postgres; Redis; Cloudinary.
2. **Next:** Read replicas; connection pooling (PgBouncer); ISR + tag revalidation for event-day traffic.
3. **Later:** Dedicated worker service for media/AI; CQRS-style read models for guest traffic; optional RLS.

Architecture avoids premature microservices while keeping package boundaries that allow extraction.

---

*Prev: [01 — Product Vision](./01-product-vision.md) · Next: [03 — Database](./03-database.md)*
