# Emotion Journey

A web-first PWA for emotion tracking with lightweight input, strong visualization,
and rule-based AI reflection.

## Highlights

- Fast mood logging: time (0-24), score (-5 to +5), one-line note
- Daily mood curve visualization
- Rule-based daily reflection (peak/valley, tags, summary)
- Weekly/monthly trends and trigger insights
- Lightweight admin tools (lexicon, risk terms, metrics)
- Privacy actions (export data, delete account/data)

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, Recharts
- Backend: Next.js Route Handlers
- Database: PostgreSQL 16 + Drizzle ORM + drizzle-kit + pg
- Tests: Vitest, Playwright (scaffold)
- Tooling: pnpm workspace, ESLint, GitHub Actions

## Monorepo Structure

```text
emotion-journey/
  apps/
    web/
  packages/
    domain/
    rule-engine/
    analytics/
    config/
    ui/
  docs/
```

## Quick Start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open: `http://localhost:3000/landing`

## Environment Variables

See `.env.example`:

- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `ADMIN_USERS`

Runtime behavior:

- If `DATABASE_URL` is set: use PostgreSQL
- If `DATABASE_URL` is empty: fallback to in-memory store (dev/demo)


## Docker (Recommended for first server deploy)

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up -d --build
```

Production recommended:

```bash
cp .env.docker.production.example .env.docker
# edit .env.docker (domain, strong password, admin emails)
docker compose --env-file .env.docker up -d --build
```

This will:

- Start PostgreSQL
- Run Drizzle migrations automatically
- Start the web app

Detailed steps: `docs/deployment-docker.md`
## Database Commands

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

## Quality Commands

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm --filter @emotion-journey/web build
```

## API Overview

- `POST /api/mood-entries`
- `GET /api/mood-entries?date=YYYY-MM-DD`
- `PATCH /api/mood-entries/:id`
- `DELETE /api/mood-entries/:id`
- `GET /api/reviews/daily?date=...`
- `POST /api/reviews/daily/generate`
- `GET /api/insights/trends?range=week|month`
- `GET /api/insights/triggers?range=week|month`
- `GET /api/admin/metrics`
- `PUT /api/admin/lexicon`
- `PUT /api/admin/risk-terms`

## Releases

- Changelog: `CHANGELOG.md`
- Release notes: `docs/releases/v0.1.0-release-notes.md`

## Community & Governance

- Contribution guide: `CONTRIBUTING.md`
- Security policy: `SECURITY.md`
- Code of conduct: `CODE_OF_CONDUCT.md`
- Issue templates: `.github/ISSUE_TEMPLATE/`
- PR template: `.github/pull_request_template.md`

## License

MIT - see `LICENSE`
