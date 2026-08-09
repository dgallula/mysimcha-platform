# Database Architecture — MySimcha Platform

## Goals

- Support millions of users and high event-day read traffic
- Enforce multi-tenant isolation by `organizationId`
- Model multi-brand experiences without schema forks
- Preserve referential integrity for billing, RSVP, and media
- Remain evolvable via Prisma migrations

## Technology

| Component | Choice |
|-----------|--------|
| RDBMS | PostgreSQL 16+ |
| ORM | Prisma |
| Pooling | PgBouncer / managed pooler in production |
| Cache | Redis (not source of truth) |
| IDs | UUID (`uuid(7)` preferred when available; Prisma `uuid()` initially) |

## Multi-tenant strategy

**Shared database, shared schema, tenant column on every org-owned row.**

### Rules

1. Tables that store customer data include `organizationId`.
2. Unique constraints that would collide across tenants are composite: `@@unique([organizationId, slug])`.
3. Public guest access uses **capability tokens** (invitation/QR) or public event slugs — still scoped to one organization via the Event row.
4. Platform-global tables (`Brand`, `Theme`, `Plan`) have **no** `organizationId`.
5. Soft deletes (`deletedAt`) for user-facing content; hard delete only via GDPR erasure workflows.

### Future hardening

PostgreSQL RLS policies keyed on `app.organization_id` session variable — planned after query patterns stabilize.

---

## Entity map

```text
Brand ──< Theme
Brand ──< Template
Brand ──< Domain

User ──< Membership >── Organization
Organization ──< Event
Organization ──< Subscription >── Plan
Organization ──< Invoice ──< Payment

Event ──< Guest
Event ──< Family
Event ──< Invitation
Event ──< Page ──< Section ──< Block
Event ──< Album ──< MediaAsset
Event ──< Rsvp
Event ──< Message / GuestBookEntry
Event ──< QrCode
Event ──< Notification
Event ── Animation (refs)
Event ── Music / Video / Photo (via MediaAsset)

Template ── Theme
Page/Section/Block can originate from Template snapshots

AiContent ── Event / Organization
Translation ── entity polymorphic or keyed
AnalyticsEvent ── Organization / Event (also mirrored to PostHog)
AuditLog ── actor User
Setting ── Organization or Brand or User scope
```

---

## Core models (logical)

### Identity & tenancy

| Model | Purpose | Key fields |
|-------|---------|------------|
| `User` | Global identity | email (unique), name, image, `passwordHash` (credentials), locale, status |
| `Account` / `Session` / `VerificationToken` | Auth.js tables | per Auth.js schema |
| `Organization` | Tenant | name, slug, billingEmail |
| `Membership` | User↔Org | role (`OWNER`, `ADMIN`, `EDITOR`, `VIEWER`) |
| `Brand` | Product line | slug, name, defaultThemeSlug |
| `BrandDomain` | Host mapping | domain (unique), brandId, isPrimary |

### Experience

| Model | Purpose |
|-------|---------|
| `Theme` | Token set (colors, fonts, motion presets) bound to brand |
| `Template` | Starter page graph for a brand |
| `Event` | Customer event under org + brand |
| `Page` | Routable experience page |
| `Section` | Ordered page region |
| `Block` | Typed content unit (JSON schema per `blockType`) |
| `Animation` | Motion definition referenced by blocks/sections |

### People & invitations

| Model | Purpose |
|-------|---------|
| `Family` | Grouping of guests |
| `Guest` | Attendee record |
| `Invitation` | Delivery channel + token + status |
| `Rsvp` | Response payload per guest/invitation |
| `GuestBookEntry` | Public/moderator guestbook |
| `Message` | Host↔guest or system messages |
| `QrCode` | Check-in / deep link artifacts |

### Media

| Model | Purpose |
|-------|---------|
| `MediaAsset` | Canonical media record (provider id, type, meta) |
| `Album` | Ordered collection for an event |
| `AlbumItem` | Media in album with sort order |

### Commerce

| Model | Purpose |
|-------|---------|
| `Plan` | Product catalog (global) |
| `Subscription` | Org subscription + Stripe ids |
| `Invoice` | Invoice snapshot |
| `Payment` | Payment attempt / charge |

### Platform

| Model | Purpose |
|-------|---------|
| `Notification` | Outbound notification log |
| `AnalyticsEvent` | First-party event log (optional mirror) |
| `AiContent` | Generated content + provenance |
| `Translation` | Override strings by locale + key |
| `Setting` | Scoped key/value config |
| `AuditLog` | Security & compliance trail |

---

## Critical relationships

- `Event.organizationId` → `Organization`
- `Event.brandId` → `Brand`
- `Event.themeId` → `Theme` (optional override)
- `Membership` unique on `[organizationId, userId]`
- `Guest.eventId` → `Event`; optional `familyId`
- `Invitation.guestId` + `eventId`
- `Page.eventId`; sections/blocks cascade
- `Subscription.organizationId` unique active constraint (partial index in SQL)
- `MediaAsset.organizationId` + optional `eventId`
- `BrandDomain.domain` globally unique

---

## Indexes (representative)

| Table | Index | Reason |
|-------|-------|--------|
| `Organization` | `slug` unique | routing |
| `Membership` | `(organizationId, userId)` unique | membership |
| `Membership` | `(userId)` | list orgs for user |
| `Event` | `(organizationId, createdAt)` | dashboard lists |
| `Event` | `(brandId, status)` | brand ops |
| `Event` | `(publicSlug)` unique where not null | guest URLs |
| `Guest` | `(eventId, email)` | lookup |
| `Invitation` | `(token)` unique | redeem |
| `Rsvp` | `(eventId, guestId)` unique | one response |
| `Page` | `(eventId, path)` unique | page routing |
| `MediaAsset` | `(organizationId, createdAt)` | library |
| `Subscription` | `(stripeSubscriptionId)` unique | webhooks |
| `AuditLog` | `(organizationId, createdAt)` | forensics |
| `BrandDomain` | `(domain)` unique | host resolve |
| `Notification` | `(status, createdAt)` | retries |

Partial indexes (raw SQL migrations) for soft-delete filters: `WHERE deleted_at IS NULL`.

---

## Constraints

- Email normalized lowercase; CHECK length bounds via app Zod (DB CHECK optional).
- Enums for `MembershipRole`, `EventStatus`, `InvitationStatus`, `RsvpStatus`, `MediaType`, `SubscriptionStatus`, `NotificationChannel`.
- Cascades: deleting Event cascades to Guests, Pages, Albums (org retained).
- Deleting Organization is a deliberate GDPR/ coolddown job — not a simple cascade from UI.
- JSON columns (`Block.content`, `Theme.tokens`, `Setting.value`) validated by Zod at write time.

---

## Prisma package layout

```text
packages/database/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts            # dev seed (owner@example.com)
│   └── migrations/
├── src/
│   ├── client.ts          # singleton PrismaClient
│   ├── tenant.ts          # requireOrganizationId / tenantWhere
│   ├── users.ts           # credentials user accessors + register txn
│   ├── organizations.ts   # org + membership accessors
│   └── index.ts
└── package.json
```

**Sprint 1 runtime note:** Auth.js uses **JWT sessions**. `Session` / `Account` / `VerificationToken` tables exist for future OAuth / DB sessions / email verify and are unused by the credentials flow today.

### Access pattern (mandatory)

```ts
// ❌ Forbidden in apps
prisma.event.findMany({ where: { status: "PUBLISHED" } });

// ✅ Required
prisma.event.findMany({
  where: { organizationId, status: "PUBLISHED", deletedAt: null },
});
```

Tenant helpers encode this pattern so features cannot accidentally omit scope.

---

## Data retention & GDPR

| Data class | Retention |
|------------|-----------|
| Account | Until deletion request + legal hold |
| Event media | Until event retention policy or erasure |
| Audit logs | Minimum 1 year (configurable) |
| Analytics | PostHog retention + minimized first-party |
| Backups | Encrypted, timed purge |

Erasure workflow (future feature): anonymize guests, delete media in Cloudinary, revoke tokens, retain invoice legal records.

---

## Migration policy

1. All schema changes via Prisma Migrate.
2. Expand/contract for breaking changes (no expand-and-break deploys).
3. CI runs `prisma validate` / generate on every PR.
4. Never edit applied migrations on shared branches.

---

## Initial migration

**Baseline migration:** `packages/database/prisma/migrations/20260724000000_init`

Generated from the existing `schema.prisma` with:

```bash
pnpm --filter=@mysimcha/database db:validate
pnpm --filter=@mysimcha/database exec prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script
```

No schema redesign was performed for this baseline.

### Migration contents (summary)

| Artifact | Count (approx.) |
|----------|-----------------|
| Enums (`CREATE TYPE`) | 17 |
| Tables | 36 |
| Foreign keys | 55 |
| Indexes (incl. unique) | 79 |
| Unique constraints/indexes | 24 |

### Relations checked (representative)

- Auth.js: `Account` / `Session` → `User` (CASCADE)
- Tenancy: `Membership` → `Organization` + `User` (CASCADE); unique `(organizationId, userId)`
- Branding: `BrandDomain` / `Theme` / `Template` → `Brand`
- Events: `Event` → `Organization` (CASCADE), `Brand` (RESTRICT), optional `Theme` / `Template` / cover `MediaAsset`
- Experience tree: `Page` → `Section` → `Block` (CASCADE); animations optional
- Guests: `Guest` / `Invitation` / `Rsvp` scoped to `Event`; `Rsvp` unique `(eventId, guestId)`
- Media: `MediaAsset` → `Organization`; albums via `AlbumItem`
- Billing: `Subscription` / `Invoice` / `Payment` → org / plan / Stripe ids unique where set
- Audit: `AuditLog` → optional `Organization` / actor `User` (SET NULL)

### Indexes & constraints checked (representative)

- Global unique: `User.email`, `Organization.slug`, `Brand.slug`, `BrandDomain.domain`, `Invitation.token`, `Event.publicSlug`
- Tenant/composite unique: `Theme(brandId, slug)`, `Template(brandId, slug)`, `Page(eventId, path)`, `Membership(organizationId, userId)`
- Stripe ids unique when present: product / price / subscription / invoice / payment
- Hot-path indexes: event lists by org + createdAt/status, invitations by status, notifications by status, audit by org + createdAt

### Known follow-ups (not changed in this baseline)

Documented for a later expand migration — **not** altered in `20260724000000_init`:

- Partial indexes `WHERE deleted_at IS NULL` remain a future raw-SQL enhancement

Integrity FKs for `AnalyticsEvent.organizationId` and `Setting.userId` were added in `20260724010000_add_analytics_org_and_setting_user_fks` (see below).

### Integrity migration: `20260724010000_add_analytics_org_and_setting_user_fks`

Fixes schema integrity without changing product architecture:

1. `AnalyticsEvent.organizationId` → `Organization` (`onDelete: Cascade`)
2. `Setting.userId` → `User` (`onDelete: Cascade`)
3. Index `Setting(userId, key)` for parity with other setting scopes

### Credentials migration: `20260725000000_add_user_password_hash`

Sprint 1 credentials auth:

1. `User.passwordHash` (`TEXT`, nullable) — set for email/password users; null for future OAuth-only users

```bash
pnpm --filter=@mysimcha/database db:validate
pnpm db:generate
docker compose up -d postgres
pnpm db:deploy
pnpm db:seed
```

### Applied migrations (ordered)

| Migration | Purpose |
|-----------|---------|
| `20260724000000_init` | Baseline schema |
| `20260724010000_add_analytics_org_and_setting_user_fks` | Org/user FK integrity |
| `20260725000000_add_user_password_hash` | Credentials `passwordHash` |

### Apply locally

Requires PostgreSQL (Docker Compose):

```bash
docker compose up -d postgres
cp .env.example .env   # if needed
pnpm db:generate
pnpm --filter=@mysimcha/database db:deploy
# or interactive:
pnpm db:migrate
```

### Create later migrations

```bash
# after editing schema.prisma
pnpm --filter=@mysimcha/database exec prisma migrate dev --name <change_name>
pnpm db:generate
```

Production / CI uses `prisma migrate deploy` only (never `migrate dev` against shared prod).

---

See also: [Architecture](./architecture.md) · [Security](./security.md) · [API](./api.md)
