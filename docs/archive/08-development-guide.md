# 08 — Development Guide

## Prerequisites

- Node.js **22+**
- pnpm **9+** (`corepack enable`)
- Docker Desktop (Postgres + Redis)
- GitHub access
- Optional: Vercel CLI, Stripe CLI

## First-time setup

```bash
# clone
cd mysimcha-platform

cp .env.example .env
# fill AUTH_SECRET, etc.

pnpm install

docker compose up -d

pnpm db:generate
pnpm db:migrate

pnpm dev
```

Default local ports:

| App | Port |
|-----|------|
| web | 3000 |
| admin | 3001 |
| landing | 3002 |
| docs | 3003 |

---

## Monorepo commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | All apps via Turbo |
| `pnpm --filter=@mysimcha/web dev` | Single app |
| `pnpm build` | Build all |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Quality gates |
| `pnpm db:studio` | Prisma Studio |

---

## Package boundaries

- Depend on `@mysimcha/*` via workspace protocol.
- Do not import from `apps/*` inside packages.
- Do not import Prisma outside `@mysimcha/database`.
- Add new shared code to the correct package — avoid dumping into `shared`.

---

## Branding locally

Set host or query:

- `DEFAULT_BRAND=mybatmitzvah` in `.env`
- `http://localhost:3002?brand=mywedding`
- Optional: map `127.0.0.1 mybatmitzvah.local` in hosts file

---

## SEO foundation (implementation contract)

All public Next.js apps follow this contract:

| Concern | Approach |
|---------|----------|
| Metadata | `generateMetadata` per route; brand-aware titles/descriptions |
| Dynamic SEO | Event/public pages from DB fields + defaults |
| Sitemap | `app/sitemap.ts` per brand domain |
| Robots | `app/robots.ts` — disallow admin, drafts, API |
| Schema.org | JSON-LD for Organization, Event, WebSite |
| Open Graph | Brand images + per-page overrides |
| i18n SEO | Locale prefixes or domain-locale map; `hreflang` alternates |

No marketing pages ship without metadata wiring.

---

## MCP integrations (developer machine)

Configure in Cursor MCP settings (not committed secrets):

### Development

| Server | Use |
|--------|-----|
| GitHub MCP | PRs, issues |
| Filesystem MCP | Controlled file ops |
| Terminal MCP | Command assist |
| Docker MCP | Compose/services |
| PostgreSQL MCP | Read-only SQL assist |
| Prisma MCP | Schema/migrate assist |

### Design

| Server | Use |
|--------|-----|
| Figma MCP | Token/component sync |

### Testing

| Server | Use |
|--------|-----|
| Playwright MCP | E2E authoring |
| Browser MCP | Visual verification |

### Business

| Server | Use |
|--------|-----|
| Stripe MCP | Catalog/webhook debugging |
| Twilio MCP | Messaging sandboxes |
| Resend MCP | Email deliverability |
| Google Maps MCP | Places/maps |

### Infrastructure

| Server | Use |
|--------|-----|
| Vercel MCP | Deployments/env |
| Sentry MCP | Error triage |

### AI

| Server | Use |
|--------|-----|
| OpenAI MCP / Claude MCP | Assisted coding — product AI still goes through `@mysimcha/ai` |

Project hint file: `.cursor/mcp.json.example`.

---

## Coding standards

- TypeScript strict; no `any` without justification.
- Prefer Server Components; client components only for interactivity.
- Zod at boundaries.
- Accessibility on every interactive primitive.
- Explain architectural changes in `docs/` when boundaries move.

---

## Testing locally

```bash
pnpm test
pnpm --filter=@mysimcha/web test:e2e
```

Use Stripe CLI for webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## What not to do in foundation PRs

- No fake business seed data
- No placeholder “coming soon” feature logic presented as real
- No brand-specific forks of apps
- No committing secrets

---

*Prev: [07 — Deployment](./07-deployment.md)*
