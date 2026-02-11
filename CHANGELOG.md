# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [0.1.1] - 2026-02-11

### Added

- Docker deployment stack (`Dockerfile`, `docker-compose.yml`, `.env.docker.example`)
- Docker deployment guide: `docs/deployment-docker.md`
- Auto migration retry loop before web startup in container

### Changed

- Removed `next/font/google` runtime build dependency
- Switched to system-font strategy for stable offline/restricted-network builds
- Updated README with Docker quick deploy steps

## [0.1.0] - 2026-02-11

### Added

- Initial public release of Emotion Journey Web PWA
- Mood logging flow with time/score/note inputs
- Daily mood curve visualization
- Daily AI-style reflection via rule engine (peak/valley/tags/summary)
- Weekly/monthly trend analytics and trigger insights
- Admin endpoints for metrics, lexicon, and risk terms
- Privacy endpoints for export and account deletion
- PostgreSQL + Drizzle integration with in-memory fallback
- Monorepo setup with shared domain/rule-engine/analytics/config/ui packages
- Repository governance files: README, LICENSE, CONTRIBUTING, SECURITY, Code of Conduct, templates

### Known Issues

- Build may fail in restricted networks due to external Google Fonts fetching via `next/font/google`.