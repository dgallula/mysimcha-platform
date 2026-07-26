# MySimcha Platform

Premium SaaS platform for **digital emotional invitations**.

**Platform:** MySimcha · **First product:** MyBatMitzvah

> **Status:** Sprint 1–2 **completed** — credentials auth, organizations, memberships, protected dashboard, and in-memory auth rate limiting (`RateLimiter` port; no Redis). Invitations, events, and other business features are **not** implemented yet.

## Documentation

| Document | Description |
|----------|-------------|
| [Product Vision](./docs/product-vision.md) | Mission and multi-brand principles |
| [Architecture](./docs/architecture.md) | Monorepo structure, dependency rules, status |
| [Database](./docs/database.md) | PostgreSQL / Prisma multi-tenant model |
| [Security](./docs/security.md) | Authn, RBAC, secrets, GDPR |
| [API](./docs/api.md) | Server Actions, Route Handlers, errors |
| [Development Guide](./docs/development-guide.md) | Setup and engineering practices |

Agent guides: [AGENTS.md](./AGENTS.md) · [CLAUDE.md](./CLAUDE.md)

> Canonical docs live in `/docs`. Historical numbered drafts are in `docs/archive/` and must not be used.

## Stack

pnpm + Turborepo · Next.js 15 · React 19 · TypeScript · Prisma · PostgreSQL · Redis · Auth.js · Stripe · Twilio · Cloudinary · OpenAI · Google Maps · Sentry · Docker · Vercel

## Structure

```text
apps/       web · admin · landing · docs
packages/   ui · database · auth · payments · emails · notifications
            media · ai · maps · analytics · branding · shared · config
tooling/    shared TypeScript configs
env/        environment templates
docs/       architecture source of truth
```

## Quick start

```bash
cp .env.example .env          # set AUTH_SECRET
pnpm install
docker compose up -d          # PostgreSQL + Redis
pnpm db:generate
pnpm db:deploy
pnpm db:seed                  # owner@example.com / password123
pnpm --filter=@mysimcha/web dev
```

Open http://localhost:3000 — routes: `/login`, `/register`, `/dashboard`.

Quality gates: `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`

## What is in place (Sprint 1)

- `@mysimcha/auth` — Auth.js credentials + JWT session + RBAC helpers
- `@mysimcha/database` — Prisma schema, migrations, user/org accessors, seed
- `apps/web` — login, register, protected dashboard
- `apps/admin`, `apps/landing`, `apps/docs` — bootable shells (health only)

## Next

Further product work (branding middleware, events, invitations, billing, etc.) only after explicit approval.
