# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/analytics/package.json packages/analytics/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/rule-engine/package.json packages/rule-engine/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @emotion-journey/web build

FROM deps AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY . .
COPY --from=build /app/apps/web/.next /app/apps/web/.next
COPY --from=build /app/apps/web/public /app/apps/web/public

EXPOSE 3000

CMD ["sh", "-c", "for i in $(seq 1 30); do pnpm db:migrate && break || { echo 'waiting for database...'; sleep 2; }; done; pnpm --filter @emotion-journey/web start"]