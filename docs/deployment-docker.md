# Docker Deployment Guide

This project supports one-command first deployment with Docker Compose.

## 1) Prepare env

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` if needed.

For production server deployment, start from:

```bash
cp .env.docker.production.example .env.docker
```

Then set at least:

- `NEXT_PUBLIC_APP_URL=https://your-domain`
- `POSTGRES_PASSWORD=<strong-random-password>`
- `ADMIN_USERS=<admin1@example.com,admin2@example.com>`

## 2) Build and start

```bash
docker compose --env-file .env.docker up -d --build
```

What happens automatically:

- PostgreSQL container starts and initializes an empty database
- Web container waits for DB and retries migrations (`pnpm db:migrate`)
- Next.js app starts on port `APP_PORT`

## 3) Check status

```bash
docker compose ps
docker compose logs -f web
docker compose logs -f db
```

## 4) Stop / restart

```bash
docker compose down
docker compose up -d
```

## 5) Data persistence

PostgreSQL data is stored in Docker volume `emotion_journey_db`.

To remove all data:

```bash
docker compose down -v
```

## 6) First server deployment checklist

- Open firewall ports (`APP_PORT`, optional `POSTGRES_PORT`)
- Set a strong `POSTGRES_PASSWORD`
- Set proper `NEXT_PUBLIC_APP_URL` to your domain
- Add admin emails via `ADMIN_USERS`
- Configure reverse proxy + TLS (Nginx/Caddy/Traefik)

## 7) Recommended production hardening

- Do not expose PostgreSQL to the public internet
- Bind `POSTGRES_PORT` to localhost or private network only
- Keep regular backups of volume `emotion_journey_db`
