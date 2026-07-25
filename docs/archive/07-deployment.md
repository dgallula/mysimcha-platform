# 07 — Deployment & DevOps

## Environments

| Name | Purpose | Apps |
|------|---------|------|
| `local` | Docker Compose Postgres/Redis + `pnpm dev` | all |
| `preview` | Per-PR Vercel previews | web, landing, admin, docs |
| `staging` | Pre-production soak | all + real Stripe test mode |
| `production` | Live multi-domain | all |

---

## Runtime topology

```text
GitHub (source of truth)
   │
   ├─ CI: lint, typecheck, unit, prisma validate
   ├─ E2E on preview URL (Playwright)
   └─ Deploy:
        ├─ Vercel project: mysimcha-web
        ├─ Vercel project: mysimcha-landing
        ├─ Vercel project: mysimcha-admin
        └─ Vercel project: mysimcha-docs

Data plane:
  Managed PostgreSQL  ← apps
  Managed Redis       ← apps
  Cloudinary          ← media
  Stripe / Resend / Twilio / Sentry / PostHog
```

---

## Docker

### Local (`docker-compose.yml`)

Services:

- `postgres` — PostgreSQL 16
- `redis` — Redis 7
- Optional later: `mailpit`, `minio` (if testing non-Cloudinary paths)

Apps run on the host via Turborepo for fast HMR; only data services are containerized by default.

### Images

`docker/Dockerfile` multi-stage builds exist for:

- CI reproducibility
- Future worker processes
- Non-Vercel fallback runtimes

---

## Environment management

| Variable group | Where set |
|----------------|-----------|
| Shared secrets | Vercel shared env / Doppler (optional later) |
| Per-app URLs | Per Vercel project |
| Brand domains | Vercel domain config + `BrandDomain` rows |
| CI secrets | GitHub Environments (`preview`, `staging`, `production`) |

Validation: `@mysimcha/config` Zod `env` schema fails fast at boot if required vars missing.

---

## Git workflow

| Branch | Policy |
|--------|--------|
| `main` | Production; protected |
| `develop` | Optional staging integration |
| `feat/*`, `fix/*`, `chore/*` | PR into `main` (or `develop`) |

Rules:

- Squash or rebase merges (team choice; default squash).
- Required checks: lint, typecheck, test, prisma.
- No force-push to `main`.
- Conventional Commit messages encouraged (`feat:`, `fix:`, `docs:`).

---

## CI/CD (GitHub Actions)

### Workflows

1. **`ci.yml`** — on PR/push: install (pnpm), lint, typecheck, unit tests, `prisma validate`.
2. **`e2e.yml`** — on preview deployment_status or workflow_run: Playwright smoke.
3. **`release.yml`** — tag-based changelog (optional later).

Vercel Git integration handles deploy; Actions gate merge quality.

### Cache

- pnpm store cache
- Turborepo remote cache (Vercel Remote Cache recommended)

---

## Domains & brands

1. Add domain in Vercel to `landing` and/or `web`.
2. Insert `BrandDomain` row pointing to `Brand`.
3. TLS via Vercel.
4. Middleware resolves brand from `Host`.

Preview URLs use `?brand=` or host headers for local brand switching.

---

## SEO deployment notes

- `apps/landing` & public `apps/web` routes emit metadata, sitemap, robots, JSON-LD.
- Admin & authenticated app routes: `noindex`.
- Per-brand sitemaps generated from brand config + published content.

---

## Observability in production

- Sentry release health tied to Git SHA
- PostHog environment separation
- `/api/health` + `/api/ready` for uptime checks

---

## Rollback

1. Vercel instant rollback to previous deployment.
2. Database: forward-only migrations; prepare expand/contract to avoid rollback couples.
3. Feature flags (PostHog) for risky launches.

---

*Prev: [06 — Design System](./06-design-system.md) · Next: [08 — Development Guide](./08-development-guide.md)*
