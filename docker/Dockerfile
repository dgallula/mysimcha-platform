# Multi-stage Dockerfile for MySimcha apps (CI / worker / non-Vercel fallback).
# Vercel remains the primary deploy target for Next.js apps.

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc ./
COPY apps ./apps
COPY packages ./packages
COPY tooling ./tooling
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS builder
COPY --from=deps /app /app
COPY . .
ARG APP_NAME=web
RUN pnpm turbo run build --filter=@mysimcha/${APP_NAME}

FROM base AS runner
ENV NODE_ENV=production
ARG APP_NAME=web
COPY --from=builder /app /app
WORKDIR /app/apps/${APP_NAME}
EXPOSE 3000
CMD ["pnpm", "start"]
