# API Architecture — MySimcha Platform

## Style

MySimcha is **Next.js-first**:

1. **Server Actions** — primary mutation path for authenticated UI.
2. **Route Handlers (`app/api/**`)** — webhooks, public token APIs, mobile/future partners.
3. **Server Components** — reads via database package (not a public HTTP API).

We do **not** expose a wide public REST surface in v1. Internal packages call Postgres directly through `@mysimcha/database`.

---

## Design rules

| Rule | Detail |
|------|--------|
| Validate all inputs | Zod schemas co-located or in `@mysimcha/shared` |
| Explicit auth | `auth()` session or verified webhook signature |
| Explicit tenant | `organizationId` from membership, never from untrusted body alone |
| Typed errors | Discriminated union / result type (`ok` / `err`) |
| Idempotency keys | Required for payments & notification sends |
| No leaky errors | Map Prisma errors to safe client messages |
| Observability | Attach `requestId`; capture exceptions in Sentry |

---

## Server Action pattern (contract)

```ts
// Pseudocode contract — not a feature implementation
"use server";

export async function updateEventSettings(input: unknown) {
  const data = updateEventSettingsSchema.parse(input);
  const session = await requireSession();
  const membership = await requireMembership(session.user.id, data.organizationId);
  assertPermission(membership, "event:update");
  return eventsService.updateSettings(data);
}
```

---

## Route Handler map (foundation)

| Route | Purpose |
|-------|---------|
| `POST /api/auth/*` | Auth.js handlers |
| `POST /api/webhooks/stripe` | Stripe events |
| `POST /api/webhooks/resend` | Email events (optional) |
| `POST /api/webhooks/twilio` | SMS status (optional) |
| `GET /api/health` | Liveness |
| `GET /api/ready` | Readiness (DB/Redis) |
| `POST /api/public/rsvp` | Token-scoped RSVP (future) |
| `GET /api/public/events/:slug` | Public event payload (future) |

Admin and landing apps expose only what they need (health + auth).

---

## Versioning

- Internal Server Actions: no URL version; evolve with app releases.
- Public HTTP (when introduced): `/api/v1/...` with deprecation policy.
- Webhooks: verify API version headers from providers; store event ids for idempotency.

---

## Webhooks

1. Read raw body.
2. Verify signature.
3. Upsert `webhook_events` idempotency row (or Redis key).
4. Process in transaction where possible.
5. Return 200 quickly; heavy work → queue interface.

---

## Error model

```ts
type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "PAYMENT_REQUIRED"
  | "INTERNAL";
```

HTTP mapping for Route Handlers: 401 / 403 / 404 / 422 / 429 / 409 / 402 / 500.

---

## Pagination & filtering

Cursor-based pagination for large lists (guests, media, audit logs).

```ts
{ cursor?: string; limit: number } // limit capped server-side
```

---

## File uploads

1. Client requests signed upload from Server Action.
2. `@mysimcha/media` creates Cloudinary signature scoped to org folder.
3. Client uploads directly to Cloudinary.
4. Client confirms → `MediaAsset` row created after validation.

---

## AI endpoints

All AI calls go through `@mysimcha/ai`:

- Check plan entitlement
- Apply rate limit
- Redact sensitive prompts in logs
- Store `AiContent` provenance (model, tokens, prompt hash)

---

## Public vs private data

| Public (guest) | Private (org members) |
|----------------|------------------------|
| Published pages & allowed blocks | Draft content |
| RSVP form fields configured by host | Guest PII lists |
| Approved guestbook entries | Billing, memberships |
| Optimized media URLs | Originals / private albums |

---

See also: [Architecture](./architecture.md) · [Security](./security.md) · [Database](./database.md)
