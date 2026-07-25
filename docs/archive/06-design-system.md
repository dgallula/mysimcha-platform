# 06 — Design System Foundation

## Intent

The MySimcha UI must feel **luxury, elegant, emotional, and modern** — closer to a high-end editorial experience than a dense admin SaaS. Admin surfaces stay calm and precise; guest and marketing surfaces carry emotion.

## Stack

| Layer | Choice |
|-------|--------|
| Primitives | React 19 + TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix) in `@mysimcha/ui` |
| Motion | Framer Motion + GSAP + Lottie |
| Icons | lucide-react (consistent set) |
| Fonts | Brand-theme driven (next/font); **no** default Inter/Roboto/Arial stacks for marketing/guest |

---

## Token architecture

Tokens are **theme-owned** and injected via CSS variables by the branding engine.

### Color roles

```text
--background / --foreground
--card / --card-foreground          (use sparingly — cards are not the default)
--primary / --primary-foreground
--secondary / --secondary-foreground
--muted / --muted-foreground
--accent / --accent-foreground
--destructive
--border / --input / --ring
--luxury-gold / --luxury-champagne / --ink / --porcelain  (brand extensions)
```

Themes (examples): `luxury-gold`, `modern-noir`, `garden-blush` — stored as JSON on `Theme.tokens`, mapped to CSS variables at runtime.

### Typography scale

| Token | Use |
|-------|-----|
| `display` | Hero brand moments |
| `headline` | Section titles |
| `title` | Card/section headers when needed |
| `body` | Reading text |
| `caption` | Meta, legal |
| `overline` | Rare; avoid chip clutter |

Marketing/guest: expressive serif/sans pairings per brand.  
Admin: restrained, highly legible pair.

### Spacing & layout

- 4px base grid (`space-1` … `space-32`)
- Section vertical rhythm: generous (luxury whitespace)
- Max content widths: `prose`, `content`, `wide`, `full`
- **One composition per first viewport** on marketing (see product design rules)

### Motion

| Tier | Library | Use |
|------|---------|-----|
| Micro | Framer Motion | fades, layout transitions |
| Narrative | GSAP | scroll-tied storytelling on landing/guest |
| Ornamental | Lottie | brand flourishes, not noise |

Ship intentional motion (2–3 strong moments) rather than ambient animation spam. Respect `prefers-reduced-motion`.

---

## Component layers

1. **Primitives** (`Button`, `Input`, `Dialog`, …) — shadcn-based, themed.
2. **Patterns** (`PageHeader`, `EmptyState`, `ConfirmAction`) — product-agnostic.
3. **Brand shells** (`BrandFrame`, `ThemeProvider`) — from `@mysimcha/branding` + `ui`.
4. **App compositions** — live in apps; not in `ui`.

### Card policy

Default: **no cards**. Cards only when they contain a clear user interaction. Guest heroes: full-bleed, no inset media cards unless a brand template explicitly requires it.

---

## Responsive rules

| Breakpoint | Width |
|------------|-------|
| `sm` | 640 |
| `md` | 768 |
| `lg` | 1024 |
| `xl` | 1280 |
| `2xl` | 1536 |

Mobile-first. Guest RSVP flows must be thumb-friendly; marketing heroes must not rely on hover.

---

## Accessibility

- WCAG 2.2 AA target for product UI
- Focus rings via `--ring`
- Semantic HTML landmarks
- Color contrast validated per theme tokens
- Motion reduction support
- Form labels and error announcements

---

## Admin vs emotional surfaces

| Surface | Visual language |
|---------|-----------------|
| `apps/landing` | Brand-first, full-bleed, emotional |
| `apps/web` guest | Template-driven luxury |
| `apps/web` app | Calm product UI, still on-brand accents |
| `apps/admin` | Dense clarity, minimal ornament |

---

## Package structure

```text
packages/ui/
├── src/
│   ├── components/
│   ├── styles/
│   │   └── globals.css          # token hooks
│   ├── lib/utils.ts             # cn()
│   └── index.ts
└── tailwind.config.ts           # preset consumed by apps
```

Apps import `@mysimcha/ui` and apply brand CSS variables from `@mysimcha/branding`.

---

*Prev: [05 — API](./05-api.md) · Next: [07 — Deployment](./07-deployment.md)*
