# Workit Ecommerce Deployment Guide

This guide deploys the full stack on **Dokploy**.

Services:
- `backend` = API at `api.workit.co.ke`
- `frontend` = storefront at `workit.co.ke`
- `admin` = admin panel at `admin.workit.co.ke`
- `postgres` = PostgreSQL database
- `redis` = cache and rate-limit store
- `typesense` = search engine

Dokploy handles:
- app deployment
- domains
- SSL certificates
- logs
- environment variables
- rollbacks

---

## 1) What you need first

You already need:
- a Linux VPS with a public IP
- SSH access as root or sudo
- DNS control for your domains
- a GitHub repository connection
- S3 or R2 for media uploads

Recommended domains:
- `workit.co.ke`
- `admin.workit.co.ke`
- `api.workit.co.ke`
- `media.workit.co.ke` if you use a separate media host

Dokploy requires these ports to be free on the server:
- `80`
- `443`
- `3000`

---

## 2) Install Dokploy

SSH into the server:

```bash
ssh root@<SERVER_IP>
```

Install Dokploy using the official script:

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

If Docker is missing, the installer sets it up automatically.

Open the Dokploy panel in your browser:

```text
http://<SERVER_IP>:3000
```

Create the Dokploy admin account, then secure the panel with a domain and HTTPS once you are ready.

If you want to update Dokploy later, the official update command is the same installer with the `update` flag.

---

## 3) Connect GitHub

In Dokploy:

1. Open **GitHub** integration
2. Install and authorize the Dokploy GitHub app
3. Connect the `workit-ecommerce` repository

Dokploy can then deploy Applications or Docker Compose projects from GitHub.

---

## 4) Create the project

In Dokploy:

1. Go to **Projects**
2. Click **New Project**
3. Name it `workit-ecommerce`

Keep all production resources inside this project.

---

## 5) Configure project variables

Dokploy supports project-level variables and service-level variables.

Use **project-level variables** for shared secrets that multiple services need.

Create these project variables:

```bash
POSTGRES_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-password>
TYPESENSE_API_KEY=<strong-api-key>
BETTER_AUTH_SECRET=<strong-random-secret>
INTERNAL_API_KEY=<strong-random-secret>
PAYSTACK_SECRET_KEY=<your-paystack-secret>
CRON_SECRET=<strong-random-secret>
INDEXNOW_KEY=<your-indexnow-key>

S3_ENDPOINT=<your-s3-or-r2-endpoint>
S3_BUCKET=<your-bucket>
S3_REGION=auto
S3_ACCESS_KEY=<your-access-key>
S3_SECRET_KEY=<your-secret-key>
S3_FORCE_PATH_STYLE=false
S3_AUTO_CREATE_BUCKET=false

PLUNK_API_KEY=<your-plunk-api-key>
PLUNK_FROM_EMAIL=no-reply@workit.co.ke
PLUNK_TEMPLATE_ID=<your-plunk-template-id>
OTP_FROM_EMAIL=no-reply@workit.co.ke

NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=<your-paystack-public-key>
NEXT_PUBLIC_PAYSTACK_ENABLED=true
NEXT_PUBLIC_CURRENCY=KES
NEXT_PUBLIC_SITE_NAME=Workit Store
```

Use **service-level variables** for variables that belong to only one app.

---

## 6) Deploy the databases

Deploy the stateful infrastructure first.

### 6.1 PostgreSQL

In Dokploy:

1. Go to **Databases**
2. Click **New Database**
3. Choose **PostgreSQL**
4. Name it `workit-db`
5. Set the database name to `workit-db`
6. Set the username to `postgres`
7. Set the password to the project variable `POSTGRES_PASSWORD`

Suggested size:
- memory: `2 GB`
- CPU: `1.5`

Recommended Dokploy limits:
- Memory limit: `2G`
- CPU limit: `1.5`

### 6.2 Redis

In Dokploy:

1. Go to **Databases**
2. Click **New Database**
3. Choose **Redis**
4. Name it `workit-redis`
5. Set the password to the project variable `REDIS_PASSWORD`

Suggested size:
- memory: `512 MB`
- CPU: `0.5`

Recommended Dokploy limits:
- Memory limit: `512M`
- CPU limit: `0.5`

### 6.3 Typesense

Deploy Typesense as an **Application**.

In Dokploy:

1. Go to **Applications**
2. Click **New Application**
3. Choose the Git source or a raw image
4. Use the image `typesense/typesense:27.1`
5. Name it `workit-typesense`

Service variables:
```bash
TYPESENSE_DATA_DIR=/data
TYPESENSE_API_KEY=${{environment.TYPESENSE_API_KEY}}
TYPESENSE_ENABLE_CORS=true
```

Expose port:
- `8108`

Add a persistent volume for `/data`.

Recommended Dokploy limits:
- Memory limit: `1G`
- CPU limit: `1`

---

## 7) Deploy the backend

The backend is the Fastify API.

### 7.1 Create the application

In Dokploy:

1. Go to **Applications**
2. Click **New Application**
3. Set **Provider** to **GitHub**
4. Choose the `workit-ecommerce` repository from your connected GitHub account
5. Set **Branch** to the production branch, usually `main`
6. Set **Build Path** to `/`
7. Leave **Trigger Type** as **On Push**
8. Set **Build Type** to **Dockerfile**
9. Set **Docker File** to `Dockerfile.backend`
10. Set **Docker Context Path** to `.`
11. Leave **Docker Build Stage** empty
12. Name the app `backend`
13. Save the app and continue to variables

For this repo, the backend Dockerfile's final runtime image is the correct build target, so you do not need a custom build stage.

Important: if Dokploy shows a standalone pnpm install step in the logs, the app is not using the Dockerfile yet. Double-check that Build Type is Dockerfile and that Docker File is exactly Dockerfile.backend.

If pnpm still prompts about removing `node_modules`, add `CI=true` as a Dokploy build/environment variable for the app. That matches the Dockerfiles and prevents pnpm from asking for interactive confirmation in a no-TTY build.

Recommended Dokploy limits:
- Memory limit: `1.5G`
- CPU limit: `1`

### 7.2 Service variables

Add these backend-only variables:

```bash
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
PRINT_ROUTES=false
STORAGE_REQUIRED=true
LOW_STOCK_THRESHOLD=10

DATABASE_URL=postgresql://postgres:${{environment.POSTGRES_PASSWORD}}@workit-db:5432/workit-db
REDIS_URL=redis://default:${{environment.REDIS_PASSWORD}}@workit-redis:6379

TYPESENSE_HOST=workit-typesense
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=${{environment.TYPESENSE_API_KEY}}
TYPESENSE_PRODUCTS_COLLECTION=products
TYPESENSE_COLLECTIONS_COLLECTION=collections
TYPESENSE_REINDEX_SCHEDULE_ENABLED=true
TYPESENSE_REINDEX_INTERVAL_MS=21600000

BETTER_AUTH_URL=https://api.workit.co.ke
BETTER_AUTH_TRUSTED_ORIGINS=https://workit.co.ke,https://admin.workit.co.ke

CORS_ORIGIN=https://workit.co.ke,https://admin.workit.co.ke
FRONTEND_URL=https://workit.co.ke
ADMIN_URL=https://admin.workit.co.ke
BACKEND_URL=https://api.workit.co.ke
PUBLIC_MEDIA_URL=https://media.workit.co.ke/uploads

USE_DDD_ORDER_MANAGEMENT=true
USE_DDD_CATALOG=true
USE_DDD_CUSTOMER=true
USE_DDD_MARKETING=true
USE_DDD_FULFILLMENT=true
```

### 7.3 Domain

Add this domain in the backend app’s **Domains** tab:

```text
api.workit.co.ke
```

Dokploy will wire the routing and HTTPS through Traefik.

---

## 8) Deploy the frontend

The frontend is the public storefront.

### 8.1 Create the application

In Dokploy:

1. Go to **Applications**
2. Click **New Application**
3. Set **Provider** to **GitHub**
4. Choose the `workit-ecommerce` repository from your connected GitHub account
5. Set **Branch** to the production branch, usually `main`
6. Set **Build Path** to `/`
7. Leave **Trigger Type** as **On Push**
8. Set **Build Type** to **Dockerfile**
9. Set **Docker File** to `Dockerfile.frontend`
10. Set **Docker Context Path** to `.`
11. Leave **Docker Build Stage** empty
12. Name the app `frontend`
13. Save the app and continue to variables

For this repo, the frontend Dockerfile’s final runtime image is the correct target, so you do not need a custom build stage.

Recommended Dokploy limits:
- Memory limit: `2G`
- CPU limit: `1.5`

### 8.2 Service variables

```bash
NODE_ENV=production
PORT=3000

DATABASE_URL=postgresql://postgres:${{environment.POSTGRES_PASSWORD}}@workit-db:5432/workit-db
REDIS_URL=redis://default:${{environment.REDIS_PASSWORD}}@workit-redis:6379

BACKEND_URL=http://backend:3001
BACKEND_API_URL=http://backend:3001
NEXT_PUBLIC_BACKEND_URL=https://api.workit.co.ke
NEXT_PUBLIC_API_URL=https://api.workit.co.ke

INTERNAL_API_KEY=${{environment.INTERNAL_API_KEY}}
BETTER_AUTH_URL=https://api.workit.co.ke
BETTER_AUTH_SECRET=${{environment.BETTER_AUTH_SECRET}}
BETTER_AUTH_TRUSTED_ORIGINS=https://workit.co.ke,https://admin.workit.co.ke

NEXT_PUBLIC_FRONTEND_BASE_URL=https://workit.co.ke
NEXT_PUBLIC_MEDIA_URL=https://media.workit.co.ke
NEXT_PUBLIC_AUTH_BASE_URL=https://workit.co.ke
NEXT_PUBLIC_AUTH_BASE_PATH=/api/auth
NEXT_PUBLIC_AUTH_COOKIE_PREFIX=store-auth
NEXT_PUBLIC_AUTH_URL=https://workit.co.ke

INDEXNOW_SITE_URL=https://workit.co.ke
INDEXNOW_KEY=${{environment.INDEXNOW_KEY}}
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=${{environment.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}}
NEXT_PUBLIC_PAYSTACK_ENABLED=${{environment.NEXT_PUBLIC_PAYSTACK_ENABLED}}
NEXT_PUBLIC_CURRENCY=${{environment.NEXT_PUBLIC_CURRENCY}}
NEXT_PUBLIC_SITE_NAME=${{environment.NEXT_PUBLIC_SITE_NAME}}
```

### 8.3 Domain

Add this domain in the frontend app’s **Domains** tab:

```text
workit.co.ke
```

---

## 9) Deploy the admin panel

The admin panel is the back office.

### 9.1 Create the application

In Dokploy:

1. Go to **Applications**
2. Click **New Application**
3. Set **Provider** to **GitHub**
4. Choose the `workit-ecommerce` repository from your connected GitHub account
5. Set **Branch** to the production branch, usually `main`
6. Set **Build Path** to `/`
7. Leave **Trigger Type** as **On Push**
8. Set **Build Type** to **Dockerfile**
9. Set **Docker File** to `Dockerfile.admin`
10. Set **Docker Context Path** to `.`
11. Leave **Docker Build Stage** empty
12. Name the app `admin`
13. Save the app and continue to variables

For this repo, the admin Dockerfile’s final runtime image is the correct target, so you do not need a custom build stage.

Recommended Dokploy limits:
- Memory limit: `1G`
- CPU limit: `0.5`

### 9.2 Service variables

```bash
NODE_ENV=production
PORT=3002
HOSTNAME=0.0.0.0

DATABASE_URL=postgresql://postgres:${{environment.POSTGRES_PASSWORD}}@workit-db:5432/workit-db
BACKEND_URL=http://backend:3001
BACKEND_API_URL=http://backend:3001
NEXT_PUBLIC_BACKEND_URL=https://api.workit.co.ke
NEXT_PUBLIC_API_URL=https://api.workit.co.ke

BETTER_AUTH_URL=https://api.workit.co.ke
BETTER_AUTH_SECRET=${{environment.BETTER_AUTH_SECRET}}
BETTER_AUTH_TRUSTED_ORIGINS=https://workit.co.ke,https://admin.workit.co.ke
ADMIN_URL=https://admin.workit.co.ke
NEXT_PUBLIC_ADMIN_BASE_URL=https://admin.workit.co.ke
NEXT_PUBLIC_AUTH_BASE_URL=https://admin.workit.co.ke
NEXT_PUBLIC_AUTH_BASE_PATH=/api/auth
NEXT_PUBLIC_AUTH_COOKIE_PREFIX=admin-auth

CORS_ORIGIN=https://workit.co.ke,https://admin.workit.co.ke
NEXT_PUBLIC_MEDIA_URL=https://media.workit.co.ke
```

### 9.3 Domain

Add this domain in the admin app’s **Domains** tab:

```text
admin.workit.co.ke
```

---

## 10) Deployment order

Use this exact order:

1. Install Dokploy
2. Connect GitHub
3. Create the project
4. Add project variables
5. Deploy PostgreSQL
6. Deploy Redis
7. Deploy Typesense
8. Deploy the backend
9. Add the backend domain
10. Deploy the frontend
11. Add the frontend domain
12. Deploy the admin panel
13. Add the admin domain
14. Run database migrations
15. Seed initial collections and homepage collections
16. Verify the site

Do not deploy the frontend or admin before the backend is available.

---

## 11) Seed initial catalog content

Before you switch the live site over, run the database seed so the initial collections and homepage collections exist.

In Dokploy, use the **backend** app terminal:

```bash
cd /app/packages/db
pnpm build
pnpm seed
```

The seed now creates:
- the initial catalog collections
- the homepage collections used by the admin pages
- the default shipping methods
- the admin user, if needed

After seeding, verify these admin pages:

- `https://admin.workit.co.ke/admin/collections`
- `https://admin.workit.co.ke/admin/homepage-collections`

If the seed runs correctly, those pages will already have records available in production.

---

## 12) Database migrations

Run migrations whenever the schema changes.

During local development, connect to the production database via SSH tunnel or VPN and run:

```bash
cd packages/db
pnpm build
pnpm exec drizzle-kit migrate
```

In Dokploy, use the **backend** app terminal:

```bash
cd /app/packages/db
pnpm build
pnpm exec drizzle-kit migrate
```

The `DATABASE_URL` environment variable is already injected by Dokploy, so no manual URL is needed inside the container.

If the migration fails, inspect the backend logs first and fix the schema issue before retrying.

If you ever see `ERR_MODULE_NOT_FOUND` for `drizzle-orm` in Dokploy, redeploy the backend after pulling the latest repo changes. The `@workit/db` package now ships `drizzle-orm` as a normal dependency, so the rebuilt image will include it.

---

## 13) Update flow

When you push a change to GitHub:

1. Pull or redeploy the relevant Dokploy application
2. Rebuild `backend` if backend or shared packages changed
3. Rebuild `frontend` if browser-facing variables or storefront code changed
4. Rebuild `admin` if admin code or browser-facing variables changed
5. Run migrations if the database schema changed

If you change any `NEXT_PUBLIC_*` variable, rebuild the affected Next.js app.

---

## 14) DNS and SSL

Point your DNS records to the VPS IP:

```text
A  workit.co.ke       -> <SERVER_IP>
A  admin.workit.co.ke -> <SERVER_IP>
A  api.workit.co.ke   -> <SERVER_IP>
```

If you use a dedicated media host, point it to your storage provider instead of the VPS.

Dokploy uses Traefik for routing and SSL. After you add the domain in the UI, Dokploy will provision HTTPS automatically.

---

## 15) Health and verification

After deploy, verify:

- `https://workit.co.ke`
- `https://admin.workit.co.ke`
- `https://api.workit.co.ke`

Also confirm:

- login works
- cart loads
- checkout starts
- uploads resolve
- search responds
- admin pages load

Use Dokploy logs if anything fails:
- backend logs
- frontend logs
- admin logs
- database logs
- Typesense logs

---

## 16) Backups

Back up:
- PostgreSQL data
- uploaded media not stored in R2/S3
- the project variables and secrets safely outside the server

Redis and Typesense are rebuildable, so database backups matter most.

Example backup command:

```bash
docker compose exec -T postgres pg_dump -U postgres workit-db | gzip > /var/backups/workit-db.sql.gz
```

---

## 17) Rollback

If a deploy breaks production:

1. Roll back the failing Dokploy application
2. Redeploy the previous image or commit
3. Restore the database backup if the schema changed in a non-compatible way

Keep the last known-good deploy handy for each of the three apps.

---

## 18) Common mistakes

- Using `localhost` instead of the Dokploy service name
- Forgetting to set project variables before deploying apps
- Changing `NEXT_PUBLIC_*` without rebuilding
- Deploying frontend/admin before the backend
- Skipping migrations after schema changes
- Pointing DB or Redis at public hosts
- Forgetting to add the domain in Dokploy after deployment
