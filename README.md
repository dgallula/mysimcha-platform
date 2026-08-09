# MySimcha Platform

Premium SaaS platform for **digital emotional invitations**.

**Platform:** MySimcha · **First product:** MyBatMitzvah

> **Status:** Sprint 1–3 **completed** — credentials auth, organizations, memberships, protected dashboard, in-memory auth rate limiting, security headers, host→brand middleware, `@mysimcha/ui` + Tailwind, admin platform auth, Playwright. Invitations, events, and other business features are **not** implemented yet.

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

## What is in place (Sprint 1–3)

- `@mysimcha/auth` — Auth.js credentials + JWT session + org RBAC + `requirePlatformRole`
- `@mysimcha/database` — Prisma schema, migrations, user/org accessors, seed (owner + platform admin)
- `@mysimcha/branding` — host / preview → brand → theme → locale (wired in web, admin, landing middleware)
- `@mysimcha/ui` — Button, Input, Label, Card + Tailwind tokens
- `apps/web` — login, register, protected dashboard, Playwright auth e2e
- `apps/admin` — platform login + dashboard (`PLATFORM_*` only)
- `apps/landing` — brand-aware marketing shell
- `apps/docs` — shell + security headers

## Next

Further product work (events, invitations, billing, etc.) only after explicit approval.
