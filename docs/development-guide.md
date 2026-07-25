# Development Guide — MySimcha Platform

## Purpose

How engineers and AI agents work on MySimcha safely and consistently.

**Current phase:** technical monorepo foundation. Do not implement application features until explicitly approved.

## Prerequisites (when bootstrapping the codebase)

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

## Intended local workflow

```bash
cp .env.example .env
pnpm install
pnpm --filter=@mysimcha/database db:validate
pnpm db:generate

# data plane (required to apply migrations):
docker compose up -d postgres
pnpm db:deploy
# optional interactive migrate:
# pnpm db:migrate

pnpm dev
# or one app:
pnpm --filter=@mysimcha/web dev
```

`web` (3000), `admin` (3001), and `landing` (3002) are minimal bootable Next.js App Router shells. Health check: `/api/health`.

### Planned local ports

| App | Port |
|-----|------|
| web | 3000 |
| admin | 3001 |
| landing | 3002 |
| docs | 3003 |

## Monorepo commands (planned)

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Run apps via Turborepo |
| `pnpm --filter=@mysimcha/web dev` | Single app |
| `pnpm build` | Build all |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Quality gates |
| `pnpm db:studio` | Prisma Studio |

## Package boundaries

- Depend on `@mysimcha/*` via workspace protocol  
- Never import from `apps/*` inside packages  
- Never use Prisma outside `@mysimcha/database`  
- Never call Stripe / Cloudinary / Twilio / OpenAI / Maps SDKs outside their packages  
- Put new shared code in the correct package — do not dump everything into `shared`  

## Branding locally (planned)

- `DEFAULT_BRAND=mybatmitzvah` in `.env`  
- Preview override: `?brand=mywedding&theme=luxury-gold&lang=fr`  
- Optional hosts file entries for brand domains on localhost  

## Environment & secrets

- Commit `.env.example` only  
- Real secrets live in local `.env`, Vercel, and GitHub Environments  
- Required integration env groups: Database, Redis, Auth, Stripe, Cloudinary, Twilio, Resend, Google Maps, OpenAI, Sentry, PostHog  

## Quality gates

| Layer | Tool |
|-------|------|
| Unit | Vitest |
| E2E | Playwright |
| Types | TypeScript strict |
| Errors | Sentry |
| Contracts | Zod |

Every PR should keep tenant isolation and RBAC intact.

## Git workflow

- `main` protected  
- Feature branches: `feat/*`, `fix/*`, `chore/*`, `docs/*`  
- CI via GitHub Actions (`.github/workflows/ci.yml`): install → Prisma validate/generate → lint → typecheck → test → build  
- No force-push to `main`  
- Conventional commits encouraged  

## MCP integrations

Configure in Cursor (user settings). Do not commit secrets.

### Development

- GitHub MCP  
- Filesystem MCP  
- Terminal MCP  
- Docker MCP  
- PostgreSQL MCP  
- Prisma MCP  

### Design

- Figma MCP  

### Testing

- Playwright MCP  
- Browser MCP  

### Business

- Stripe MCP  
- Twilio MCP  
- Resend MCP  
- Google Maps MCP  

### Infrastructure

- Vercel MCP  
- Sentry MCP  

### AI assist

- OpenAI MCP  
- Claude MCP  

**Rule:** MCP helps humans/agents develop faster. Runtime product features still call `@mysimcha/*` packages.

## Coding standards (when implementation starts)

- TypeScript strict; avoid `any` without justification  
- Prefer Server Components  
- Zod at boundaries  
- Accessibility on interactive UI  
- Luxury visual language on marketing/guest surfaces  
- Update `/docs` when architecture changes  

## What not to do in this phase

- Do not create application feature code  
- Do not add fake business seed data  
- Do not invent placeholder “coming soon” business logic presented as real  
- Do not fork apps per brand  

## After documentation approval

Suggested implementation order:

1. Monorepo bootstrap (if not already present)  
2. Auth.js + organizations / memberships  
3. Branding middleware  
4. Event / invitation core  
5. Guest public pages + RSVP  
6. Media (Cloudinary)  
7. Stripe subscriptions  
8. Twilio notifications  
9. OpenAI assists  
10. Sentry + PostHog hardening  

---

See also: [Product Vision](./product-vision.md) · [Architecture](./architecture.md) · [Database](./database.md) · [Security](./security.md) · [API](./api.md)
