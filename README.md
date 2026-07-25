# MySimcha Platform

Premium SaaS platform for **digital emotional invitations**.

**Platform:** MySimcha · **First product:** MyBatMitzvah

> **Status:** minimal bootable Next.js apps (`web`, `admin`, `landing`). No business features yet.

## Documentation

| Document | Description |
|----------|-------------|
| [Product Vision](./docs/product-vision.md) | Mission and multi-brand principles |
| [Architecture](./docs/architecture.md) | Monorepo structure, dependency rules, workflow |
| [Database](./docs/database.md) | PostgreSQL / Prisma multi-tenant model |
| [Security](./docs/security.md) | Authn, RBAC, secrets, GDPR |
| [API](./docs/api.md) | Server Actions, Route Handlers, errors |
| [Development Guide](./docs/development-guide.md) | Setup and engineering practices |

Agent guides: [AGENTS.md](./AGENTS.md) · [CLAUDE.md](./CLAUDE.md)

> Canonical docs live in `/docs`. Historical numbered drafts are in `docs/archive/` and must not be used.

## Stack

pnpm + Turborepo · Next.js 15 · React 19 · TypeScript · Prisma · PostgreSQL · Redis · Stripe · Twilio · Cloudinary · OpenAI · Google Maps · Sentry · Docker · Vercel

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
cp .env.example .env
pnpm install
docker compose up -d
pnpm lint
pnpm typecheck
```

## Next

Application pages and features start only after explicit approval.
