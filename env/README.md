# Environment templates for MySimcha Platform

| File | Purpose |
|------|---------|
| `../.env.example` | Full variable catalog (source of truth) |
| `.env.development.example` | Local development defaults |
| `.env.staging.example` | Staging checklist |
| `.env.production.example` | Production checklist |

## Usage

1. Copy `../.env.example` → `../.env`
2. Fill secrets locally (never commit `.env`)
3. For Vercel, map the same keys per environment
4. Optional app overrides: `apps/<app>/.env.local`
