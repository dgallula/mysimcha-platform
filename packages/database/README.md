# @mysimcha/database

Prisma ORM layer and PostgreSQL access for MySimcha Platform.

## Layout

```text
prisma/
  schema.prisma
  migrations/
    20260724000000_init/
      migration.sql
    20260724010000_add_analytics_org_and_setting_user_fks/
      migration.sql
    migration_lock.toml
src/
  client.ts
  tenant.ts
  index.ts
```

## Commands

```bash
# From repo root
pnpm --filter=@mysimcha/database db:validate
pnpm db:generate
pnpm --filter=@mysimcha/database db:deploy   # apply migrations (CI / local)
pnpm db:migrate                              # migrate dev (local interactive)
pnpm db:studio
```

## Initial migration

Baseline: `20260724000000_init` — generated from the existing schema (no redesign).

Integrity follow-up: `20260724010000_add_analytics_org_and_setting_user_fks` — adds missing FKs for `AnalyticsEvent.organizationId` and `Setting.userId`.

See [docs/database.md](../../docs/database.md) for process, relation/index review, and apply steps.

## Tenant rule

Always scope organization data with `organizationId` (helpers in `src/tenant.ts`).
