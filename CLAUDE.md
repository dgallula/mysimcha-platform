# CLAUDE.md — MySimcha Platform

Guidance for Claude (and compatible coding agents) in this repository.

## Project

**MySimcha** is a premium SaaS platform for digital emotional invitations.

- Monorepo: Turborepo + pnpm  
- Apps: Next.js 15 + React 19 + TypeScript  
- Data: PostgreSQL + Prisma + Redis  
- Integrations: Stripe, Twilio, Cloudinary, OpenAI, Google Maps, Sentry  
- Deploy: Docker (local data plane) + Vercel (apps)

First commercial brand: **MyBatMitzvah**. All future brands share the same platform.

## Before writing code

1. Read [docs/product-vision.md](./docs/product-vision.md)
2. Read [docs/architecture.md](./docs/architecture.md)
3. Read [docs/database.md](./docs/database.md)
4. Read [docs/security.md](./docs/security.md)
5. Read [docs/api.md](./docs/api.md)
6. Read [docs/development-guide.md](./docs/development-guide.md)
7. Obey [AGENTS.md](./AGENTS.md)
8. If the task is application/feature work and only documentation was requested, **stop and ask**

> Use **canonical docs only**. Do not follow files under `docs/archive/`.

## Current phase

**Sprint 1–3 completed** — identity, multi-tenant, in-memory auth rate limiting, security headers, branding middleware, UI primitives, admin platform auth, Playwright.  
Do not implement invitations, events, or other business features unless explicitly requested.

## Implementation preferences (when coding is approved)

- TypeScript strict mode
- Zod at every trust boundary
- Keep providers behind packages (`auth`, `payments`, `media`, `ai`, `emails`, `notifications`, `maps`)
- Brand differences belong in branding config + themes/templates — never forks
- Workspace packages use `@mysimcha/<name>`
- Instrument errors with Sentry; never log secrets

## Do not

- Bypass tenant filters (`organizationId`)
- Call Stripe / Cloudinary / Twilio / OpenAI / Maps SDKs from apps directly
- Create per-brand codebases
- Commit `.env` secrets
- Edit historical Prisma migrations
- Introduce microservices prematurely — extract packages first

## Common commands (when the repo is bootstrapped)

```bash
pnpm install
docker compose up -d
pnpm db:generate && pnpm db:migrate
pnpm dev
pnpm lint && pnpm typecheck && pnpm test
```

## Documentation updates

Any architectural decision must be mirrored under `/docs`. Keep `README.md` status accurate.
