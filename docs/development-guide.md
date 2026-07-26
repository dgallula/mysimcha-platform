# Development Guide — MySimcha Platform

## Purpose

How engineers and AI agents work on MySimcha safely and consistently.

**Current phase:** Sprint 1 completed; Sprint 2 auth rate limiting (in-memory, no Redis) completed.  
Do **not** implement invitations, events, or other business features unless explicitly asked.

## Prerequisites

- Node.js 22+
- pnpm 9+
- Docker Desktop (PostgreSQL + Redis)
- GitHub access
- Optional: Vercel CLI, Stripe CLI, Twilio CLI

## Documentation map

**Canonical docs only** (do not use `docs/archive/`):

| File | Use when |
|------|----------|
| [product-vision.md](./product-vision.md) | Understanding *what* we build |
| [architecture.md](./architecture.md) | Understanding *how* the system is shaped |
| [database.md](./database.md) | Schema, tenancy, Prisma rules |
| [security.md](./security.md) | Authn/authz, RBAC, secrets, GDPR |
| [api.md](./api.md) | Server Actions, Route Handlers, errors |
| [development-guide.md](./development-guide.md) | Setup, workflow, MCP |
| [../AGENTS.md](../AGENTS.md) | Agent hard rules |
| [../CLAUDE.md](../CLAUDE.md) | Claude-specific working agreement |
| [../README.md](../README.md) | Repo entrypoint |

## Local setup

```bash
cp .env.example .env          # set AUTH_SECRET (required for auth)
pnpm install
docker compose up -d          # PostgreSQL + Redis
pnpm db:generate
pnpm db:deploy
pnpm db:seed
pnpm --filter=@mysimcha/web dev
```

| App | Port | Status |
|-----|------|--------|
| web | 3000 | Sprint 1 auth + dashboard |
| admin | 3001 | Shell (`/api/health`) |
| landing | 3002 | Shell (`/api/health`) |
| docs | 3003 | Shell (`/api/health`) |

### Auth routes (`apps/web`)

| Route | Notes |
|-------|-------|
| `/login` | Credentials sign-in |
| `/register` | Creates user + organization + OWNER membership |
| `/dashboard` | Protected; requires session |
| `/api/auth/*` | Auth.js handlers |

Seed (dev only): `owner@example.com` / `password123`

## Monorepo commands

| Command | Purpose |
|---------|---------|
| `pnpm --filter=@mysimcha/web dev` | Run customer app |
| `pnpm build` | Build all apps |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Quality gates |
| `pnpm db:generate` | Prisma Client |
| `pnpm db:deploy` | Apply migrations |
| `pnpm db:seed` | Dev seed user/org |
| `pnpm db:studio` | Prisma Studio |

## Package boundaries

- Depend on `@mysimcha/*` via workspace protocol  
- Never import from `apps/*` inside packages  
- Never use Prisma outside `@mysimcha/database`  
- Never call Stripe / Cloudinary / Twilio / OpenAI / Maps SDKs outside their packages  
- Put new shared code in the correct package — do not dump everything into `shared`  

## Branding locally (not wired in Sprint 1)

- `DEFAULT_BRAND=mybatmitzvah` in `.env` (reserved)  
- Static registry exists in `@mysimcha/branding`  
- Host/middleware brand resolution is **not** implemented yet  

## Environment & secrets

- Commit `.env.example` only  
- Real secrets live in local `.env`, Vercel, and GitHub Environments  
- Sprint 1 required: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`  
- Other integration groups (Stripe, Cloudinary, …) are catalogued for later  

## Quality gates

| Layer | Tool | Sprint 1 |
|-------|------|----------|
| Unit | Vitest | `shared`, `auth`, `database` |
| Types | TypeScript strict | CI enforced |
| Lint | ESLint | CI enforced |
| E2E | Playwright | Not yet |
| Errors | Sentry | Env only |

Every PR should keep tenant isolation and RBAC intact.

## Git workflow

- `main` protected  
- Feature branches: `feat/*`, `fix/*`, `chore/*`, `docs/*`  
- CI (`.github/workflows/ci.yml`): install → Prisma validate/generate → lint → typecheck → test → build  
- No force-push to `main`  

## MCP integrations

Optional Cursor DX. Configure locally; do not commit secrets.  
Example: `.cursor/mcp.json.example` (github, filesystem, postgres, stripe).

Full recommended list (when useful): GitHub, Filesystem, Docker, PostgreSQL, Prisma, Playwright, Browser, Stripe, Twilio, Resend, Google Maps, Vercel, Sentry, OpenAI, Claude.

**Rule:** MCP assists development. Runtime product code uses `@mysimcha/*` packages.

## Coding standards

- TypeScript strict; avoid `any` without justification  
- Prefer Server Components  
- Zod at boundaries  
- Accessibility on interactive UI  
- Update `/docs` when architecture or status changes  

## What not to do yet

- Do not implement invitations, events, or guest experiences  
- Do not present unfinished integration stubs as production features  
- Do not fork apps per brand  

## Implementation order

1. ~~Monorepo bootstrap~~  
2. ~~Auth.js + organizations / memberships (Sprint 1)~~ **completed**  
3. ~~Auth rate limiting — `RateLimiter` + `MemoryRateLimiter` (Sprint 2)~~ **completed** (no Redis)  
4. Branding middleware / further hardening (when approved)  
5. Event / invitation core  
6. Guest public pages + RSVP  
7. Media (Cloudinary)  
8. Stripe subscriptions  
9. Twilio notifications  
10. OpenAI assists  
11. Sentry + PostHog hardening  

---

See also: [Product Vision](./product-vision.md) · [Architecture](./architecture.md) · [Database](./database.md) · [Security](./security.md) · [API](./api.md)
