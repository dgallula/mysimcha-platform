# 01 — Product Vision

## Mission

**MySimcha** is a premium SaaS platform for creating emotional digital event experiences. Families and organizers craft immersive invitation sites, RSVP flows, media albums, guest books, and live event moments — with the polish of a luxury brand and the reliability of enterprise SaaS.

## First commercial product

| Product | Domain (example) | Audience |
|---------|------------------|----------|
| **MyBatMitzvah** | mybatmitzvah.com | Families celebrating Bat Mitzvah |

## Future products (same platform)

| Product | Domain (example) |
|---------|------------------|
| MyBarMitzvah | mybarmitzvah.com |
| MyWedding | mywedding.com |
| MyBritMilah | mybritmilah.com |
| MyBirthday | mybirthday.com |
| MyEngagement | myengagement.com |
| Corporate Events | mycorporateevents.com / white-label |

## Non-negotiable platform principles

1. **One codebase** — all products share apps, packages, APIs, and infrastructure.
2. **One backend** — Next.js Server Actions / Route Handlers + shared domain packages.
3. **One database** — PostgreSQL with multi-tenant isolation by organization + brand.
4. **One auth** — Auth.js (primary choice) with shared session and RBAC.
5. **One payments** — Stripe Billing + Checkout, brand-aware pricing catalogs.
6. **One AI engine** — shared `@mysimcha/ai` for copy, translations, media assist.
7. **One media system** — Cloudinary (primary) via `@mysimcha/media`.
8. **Brand differentiation only** — branding, themes, templates, copy, assets, domains.

## Target quality bar

Architecture and DX should be comparable in rigor to platforms such as Vercel, Stripe, Linear, Canva, and Framer:

- Predictable performance under load
- Strong tenancy and security boundaries
- Opinionated monorepo with fast feedback loops
- Design system that feels luxury, not generic SaaS chrome
- Observability first (Sentry + PostHog)

## Priority order

1. Scalability  
2. Security  
3. Maintainability  
4. Developer experience  
5. Performance  
6. SEO  
7. Clean architecture  

## Core user journeys (architectural scope only)

These journeys define bounded contexts — **not** features to implement yet:

1. **Account & organization** — sign up, invite collaborators, roles.
2. **Event creation** — create event under a brand, pick theme/template.
3. **Experience builder** — compose pages from blocks/sections/animations.
4. **Guest experience** — public branded site, RSVP, messages, albums.
5. **Media** — upload, transform, deliver photos/video/audio.
6. **Communications** — email / SMS / WhatsApp notifications.
7. **Billing** — subscribe, invoices, entitlements.
8. **Admin operations** — platform support, brand config, abuse handling.

## Bounded contexts

| Context | Owns | Package(s) |
|---------|------|------------|
| Identity | Users, sessions, OAuth | `@mysimcha/auth` |
| Tenancy | Organizations, memberships, brands | `@mysimcha/database`, `@mysimcha/branding` |
| Events | Events, guests, families, invitations | `@mysimcha/database` + app layer |
| Experience | Templates, themes, pages, blocks, animations | `@mysimcha/branding`, `@mysimcha/ui` |
| Media | Assets, albums, CDN delivery | `@mysimcha/media` |
| Engagement | RSVP, guestbook, messages, QR | app layer + notifications |
| Billing | Plans, subscriptions, invoices, payments | `@mysimcha/payments` |
| Comms | Email, SMS, WhatsApp, push | `@mysimcha/emails`, `@mysimcha/notifications` |
| Intelligence | AI content, translations assists | `@mysimcha/ai` |
| Insights | Product analytics, funnels | `@mysimcha/analytics` |
| Platform Admin | Global ops, audit, support | `apps/admin` |

## Success metrics (platform-level)

- Horizontal scale to **millions of users** and **high concurrent guest traffic** on event day.
- **p95** page TTFB suitable for marketing + guest sites on Vercel edge/Node.
- **Zero cross-tenant data leakage** (enforced at query + policy layers).
- New brand launch = config + assets + domain, **not** a fork.
- New engineer productive in the monorepo within **one day** via docs + AGENTS.md.

## Out of scope for foundation phase

- Business feature implementation
- Seed / fake demo data
- Placeholder “TODO” business logic
- Per-brand code forks

---

*Next: [02 — Architecture](./02-architecture.md)*
