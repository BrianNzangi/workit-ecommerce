# Workit Ecommerce Monorepo

This repo contains the full Workit stack:

- `frontend` - storefront (`workit.co.ke`)
- `admin` - admin app (`admin.workit.co.ke`)
- `backend` - Fastify API (`api.workit.co.ke`)
- `packages/db` - Drizzle schema, migrations, seed scripts
- `packages/validation` - shared validation/types

## Prerequisites

- `Node.js 20+`
- `pnpm 10+`
- Docker Desktop if you want local Postgres/MinIO

## Install

```bash
pnpm install
```

## Local Development

### Option 1: Full local app run

Use this when running everything from your machine:

```bash
pnpm dev
```

Expected local ports:

- storefront: `3000`
- backend: `3001`
- admin: `3002`

Notes:

- make sure those ports are free before starting
- backend dev will auto-push the DB schema in development by default
- to disable that locally, set `DB_AUTO_PUSH=false` in `backend/.env`

### Option 2: Docker for infra/backend, local for UI

Use this when you want Postgres, MinIO, backend, and Drizzle Studio in containers:

```bash
docker compose up --build
```

Then run UI apps locally as needed:

```bash
pnpm --filter @workit/frontend dev
pnpm --filter @workit/admin dev
```

Useful local endpoints:

- backend: `http://localhost:3001`
- admin: `http://localhost:3002`
- storefront: `http://localhost:3000`
- MinIO API: `http://localhost:9000`
- MinIO console: `http://localhost:9001`
- Drizzle Studio: `http://localhost:4983`

## Database Commands

### Local schema push

From repo root:

```bash
pnpm db:push
```

Or through backend:

```bash
pnpm --dir backend db:push
```

### Local Drizzle Studio

```bash
pnpm db:studio
```

### Local seed

```bash
pnpm --filter @workit/db build
pnpm --filter @workit/db seed
```

## Production Database Changes

Production schema changes are **manual**.

Do not rely on backend startup to push schema in production.

### When you add or change a DB column/table

SSH or exec into the production app container and run:

```bash
cd /app
pnpm --filter @workit/db build
pnpm --dir /app/backend db:push
```

That is the correct production push flow for this repo.

If you are already inside `/app/backend`, you can also run:

```bash
pnpm db:push
```

### Example: current banner fix

The `Banner.productId` production issue is resolved by running the production `db:push` command above so the latest Drizzle schema is applied.

## Production Seeding

Be careful with seeding in production.

Recommended approach:

- schema changes: use `db:push`
- content changes: use the admin UI where possible
- one-off production data backfills: run targeted SQL/scripts, not the full seed blindly

If you intentionally need the repo seed script in production:

```bash
cd /app
pnpm --filter @workit/db build
pnpm --filter @workit/db seed
```

Only do that if you have reviewed `packages/db/src/seed.ts` and confirmed it is safe for the live database.

## Media / CDN

Uploads are stored in MinIO and served by the backend at:

- `/uploads/:filename`

For production CDN/media routing:

- `NEXT_PUBLIC_MEDIA_URL=https://media.workit.co.ke`

When that env var is set, frontend/admin image helpers will prefer the dedicated media host.

## Sitemap And IndexNow

The storefront sitemap is generated from the current live structure:

- static public pages
- nested collection paths
- product detail pages
- published blog posts

IndexNow key file is hosted from the storefront public root at:

- `/1362f663ee08495c823032577fefb4db.txt`

Recommended frontend env values:

```bash
NEXT_PUBLIC_FRONTEND_BASE_URL=https://workit.co.ke
INDEXNOW_SITE_URL=https://workit.co.ke
INDEXNOW_KEY=1362f663ee08495c823032577fefb4db
```

To submit URLs internally after content changes, call the protected frontend route:

```bash
curl -X POST https://workit.co.ke/api/indexnow \
  -H "Content-Type: application/json" \
  -H "x-api-key: <INTERNAL_API_KEY>" \
  -d '{"scope":"products"}'
```

Supported request body fields:

- `scope`: one of `static`, `products`, `collections`, `blogs`, `all`
- `scopes`: array version of the above
- `paths`: relative site paths like `["/deal-details/example-slug"]`
- `urls`: fully-qualified URLs on the canonical storefront host

Examples:

```bash
curl -X POST https://workit.co.ke/api/indexnow \
  -H "Content-Type: application/json" \
  -H "x-api-key: <INTERNAL_API_KEY>" \
  -d '{"paths":["/deal-details/example-product","/collections/phones/android"]}'
```

```bash
curl -X POST https://workit.co.ke/api/indexnow \
  -H "Content-Type: application/json" \
  -H "x-api-key: <INTERNAL_API_KEY>" \
  -d '{"scopes":["products","collections","blogs"]}'
```

## Deployment Notes

- frontend and admin `next.config.ts` changes require a full rebuild/redeploy
- database schema changes require a manual production `db:push`
- if `media.workit.co.ke/uploads/...` works directly, Cloudflare can cache those assets at the edge

## Common Fixes

### `column ... does not exist`

Your deployed code is ahead of the production database schema.

Run:

```bash
cd /app
pnpm --filter @workit/db build
pnpm --dir /app/backend db:push
```

### `/_next/image ... 400`

Usually means one of these:

- frontend/admin was not rebuilt after `next.config.ts` changes
- the image host is not allowed in Next config
- the media origin is failing

Check direct image access first:

```bash
https://media.workit.co.ke/uploads/<filename>
```

## Workspace Scripts

From repo root:

```bash
pnpm dev
pnpm build
pnpm db:push
pnpm db:studio
```
