# Product Vision — MySimcha Platform

## Mission

**MySimcha** is a premium SaaS platform for creating **digital emotional invitations** and event experiences.

Families and organizers craft immersive invitation sites, RSVP flows, media albums, guest books, and live event moments — with luxury-brand polish and enterprise SaaS reliability.

## First commercial product

| Product | Example domain | Audience |
|---------|----------------|----------|
| **MyBatMitzvah** | mybatmitzvah.com | Families celebrating Bat Mitzvah |

## Future products (same platform)

| Product | Example domain |
|---------|----------------|
| MyBarMitzvah | mybarmitzvah.com |
| MyWedding | mywedding.com |
| MyBritMilah | mybritmilah.com |
| MyBirthday | mybirthday.com |
| MyEngagement | myengagement.com |
| Corporate Events | white-label / corporate domain |

## Non-negotiable principles

All products must share:

- same codebase  
- same backend  
- same database  
- same authentication  
- same payment system (Stripe)  
- same AI engine (OpenAI via shared package)  
- same media system (Cloudinary)  

Only **branding**, **templates**, and **content** change.

## Multi-brand experience

The platform must detect and apply:

- domain  
- brand  
- theme  
- templates  
- colors / design tokens  
- assets  
- language  

Example:

- Brand: MyBatMitzvah  
- Theme: Luxury Gold  
- Language: French  

## Product surfaces

| Surface | Purpose |
|---------|---------|
| Marketing sites | Acquire customers per brand domain |
| Customer app | Create and manage invitations / events |
| Guest experience | View invitation, RSVP, media, guestbook |
| Admin | Platform operations, brands, support |
| Docs | Engineering documentation |

## Bounded contexts

| Context | Responsibility |
|---------|----------------|
| Identity | Users, sessions, OAuth |
| Tenancy | Organizations, memberships, brands |
| Events | Events, guests, families, invitations |
| Experience | Templates, themes, pages, blocks, animations |
| Media | Photos, videos, audio, albums (Cloudinary) |
| Engagement | RSVP, guestbook, messages, QR codes |
| Billing | Plans, subscriptions, invoices, payments (Stripe) |
| Communications | Email, SMS, WhatsApp (Twilio) |
| Intelligence | AI content & assists (OpenAI) |
| Maps | Venues & locations (Google Maps) |
| Insights | Analytics |
| Platform ops | Admin, audit, Sentry-backed reliability |

## Success criteria

- Scale toward **millions of users**
- Safe multi-tenant isolation
- New brand launch = configuration + assets + domain (not a fork)
- Experience feels **luxury, elegant, emotional, modern**
- Engineering quality comparable to Vercel / Stripe / Linear / Canva / Framer

## Priority order

1. Scalability  
2. Security  
3. Maintainability  
4. Developer experience  
5. Performance  
6. SEO  
7. Clean architecture  

## Out of scope for documentation phase

- Application feature implementation  
- Fake / demo business data  
- Placeholder business logic  

---

See also: [Architecture](./architecture.md) · [Database](./database.md) · [Security](./security.md) · [API](./api.md) · [Development Guide](./development-guide.md)
