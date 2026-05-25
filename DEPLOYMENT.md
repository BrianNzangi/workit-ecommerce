# Production Deployment — Single VPS with Coolify

## Server Spec

| Resource | Value |
|----------|-------|
| vCPU | **6 cores** |
| RAM | **12 GB** |
| Storage | **100 GB NVMe** (recommended) or 200 GB SSD |
| Snapshot | **2 snapshots** |
| Port | **300 Mbit/s** |
| Traffic | Unlimited |

> **Choose NVMe over SSD.** PostgreSQL and Typesense benefit massively from low-latency random I/O.

---

## Architecture

```
                      ┌──────────────────────────────────────┐
                      │         SINGLE VPS SERVER            │
                      │   6 vCPU · 12 GB · 100 GB NVMe      │
                      │                                      │
                      │   ┌──────────────┐                   │
                      │   │   Coolify    │  (port 8000)      │
                      │   │  (UI + API)  │   management UI   │
                      │   └──────┬───────┘                   │
                      │          │ manages                   │
                      │          ▼                           │
                      │   ┌──────────────┐  port 3000        │
                      │   │   Frontend   │  storefront       │
                      │   │  (Next.js)   │  workit.co.ke     │
                      │   └──────────────┘                   │
                      │   ┌──────────────┐  port 3001        │
                      │   │   Backend    │  API               │
                      │   │  (Fastify)   │  api.workit.co.ke  │
                      │   └──────────────┘                   │
                      │   ┌──────────────┐  port 3002        │
                      │   │   Admin      │  dashboard         │
                      │   │  (Next.js)   │  admin.workit.co.ke│
                      │   └──────────────┘                   │
                      │   ┌──────────────┐  port 5432        │
                      │   │  PostgreSQL  │  database          │
                      │   └──────────────┘                   │
                      │   ┌──────────────┐  port 6379        │
                      │   │    Redis     │  cache + queue     │
                      │   └──────────────┘                   │
                      │   ┌──────────────┐  port 8108        │
                      │   │  Typesense   │  search engine     │
                      │   └──────────────┘                   │
                      └──────────────────────────────────────┘
```

### Resource allocation (single server)

| Service | RAM | vCPU | Storage | Notes |
|---------|-----|------|---------|-------|
| **PostgreSQL** | **2 GB** | **1.5** | **~20–40 GB** | Main data store |
| **Redis** | **512 MB** | **0.5** | — | Cache + job queue (minimal persistence) |
| **Typesense** | **1 GB** | **1** | **~2–5 GB** | Search index |
| **Backend** | **1.5 GB** | **1** | — | Fastify Node.js API |
| **Frontend** | **2 GB** | **1.5** | — | Next.js SSR storefront |
| **Admin** | **1 GB** | **0.5** | — | Next.js admin panel |
| **OS + buffers** | **~1.5 GB** | **—** | **~15 GB** | Ubuntu, disk cache, Docker layers |
| **Build cache** | — | — | **~10 GB** | `.next` builds, pnpm store, Docker layers |
| **Free headroom** | **~2.5 GB** | **—** | **~30 GB** | Traffic spikes, growth, logs |
| **Total** | **~12 GB** | **6** | **~100 GB** | |

---

## 1. Provision the VPS

Any provider works. Recommended options:

| Provider | Approx cost |
|----------|------------|
| Hetzner CX32 | €10.99/mo |
| Netcup RS 2000 | ~€10/mo |
| DigitalOcean Premium | $36/mo |
| Vultr High Frequency | $32/mo |
| Linode Dedicated | $36/mo |

**OS:** Ubuntu 24.04 LTS

### Initial setup

```bash
# SSH in as root
ssh root@<SERVER_IP>

# Create a deploy user
adduser deploy
usermod -aG sudo deploy

# Harden SSH
sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# Set up firewall — only expose web ports + Coolify
ufw allow OpenSSH
ufw allow 80/tcp    # HTTP (Coolify proxy)
ufw allow 443/tcp   # HTTPS (Coolify proxy)
ufw allow 8000/tcp  # Coolify UI (or restrict to your IP)
ufw --force enable
```

---

## 2. Install Coolify

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

This installs Docker, Docker Compose, and Coolify automatically.

### Post-install

1. Open `http://<SERVER_IP>:8000` in your browser
2. Create an admin account
3. **Settings → SSL** — enable auto SSL once you point domains to this server
4. The local server is auto-registered as a Coolify server (rename it to something meaningful like **workit-vps**)

### Add your GitHub repository

1. **Coolify UI → Sources → GitHub → Connect**
2. Authorize Coolify to access your GitHub account
3. Select the `workit-ecommerce` repository

---

## 3. Deploy Infrastructure via Coolify

Coolify can manage databases natively. Go to **Databases** in the Coolify UI.

### 3.1 PostgreSQL

**Databases → PostgreSQL → New**

| Setting | Value |
|---------|-------|
| Name | `workit-db` |
| Server | localhost |
| PostgreSQL Version | `15` |
| Port | `5432` (internal) |
| Username | `postgres` |
| Password | Generate a strong one |
| Database | `workit-db` |
| Volumes | `postgres_data` |
| Memory Limit | `2G` |
| CPU Limit | `1.5` |

Coolify will auto-assign the `DATABASE_URL` connection string.

### 3.2 Redis

**Databases → Redis → New**

| Setting | Value |
|---------|-------|
| Name | `workit-redis` |
| Server | localhost |
| Redis Version | `7` |
| Port | `6379` (internal) |
| Password | Generate a strong one |
| Memory Limit | `512M` |
| CPU Limit | `0.5` |

### 3.3 Typesense

Typesense is not a built-in Coolify database type. Deploy it as an **Application**:

**Resources → New → Application**

| Setting | Value |
|---------|-------|
| Name | `workit-typesense` |
| Source | **Simple Dockerfile** |
| Image | `typesense/typesense:27.1` |
| Port | `8108` |
| Server | localhost |

**Environment Variables:**

```bash
TYPESENSE_DATA_DIR=/data
TYPESENSE_API_KEY=<generate-a-typesense-api-key>
TYPESENSE_ENABLE_CORS=true
```

**Volumes:** Mount `/data` to a named volume `typesense_data`.

**Resource Limits:** Memory `1G`, CPU `1`.

---

## 4. Deploy Application Services

Create a **Project** first:

**Projects → New Project**

- **Name:** `workit-ecommerce`
- **Description:** Workit Ecommerce Platform

Then add each service as a **Resource** inside this project.

### 4.1 Backend (Fastify API)

**Resources → New → Application**

| Setting | Value |
|---------|-------|
| Name | `backend` |
| Source | GitHub → `workit-ecommerce` |
| Server | localhost |
| Build Pack | Dockerfile |
| Dockerfile Location | `/Dockerfile.backend` |
| Port | `3001` |
| Domains | `api.workit.co.ke` |

**Environment Variables:**

```bash
# Database (use the internal Docker network hostname)
# Coolify PostgreSQL creates a DNS entry: <database-name>-<uuid>.coolify
DATABASE_URL=postgresql://postgres:<POSTGRES_PASSWORD>@<POSTGRES_HOST>:5432/workit-db

# Redis
REDIS_URL=redis://default:<REDIS_PASSWORD>@<REDIS_HOST>:6379

# Typesense
TYPESENSE_HOST=<TYPESENSE_HOST>
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=<TYPESENSE_API_KEY>
TYPESENSE_PRODUCTS_COLLECTION=products

# Auth
BETTER_AUTH_SECRET=<generate-a-secret>
BETTER_AUTH_URL=https://api.workit.co.ke

# URLs
BACKEND_URL=https://api.workit.co.ke
FRONTEND_URL=https://workit.co.ke
ADMIN_URL=https://admin.workit.co.ke
CORS_ORIGIN=https://workit.co.ke,https://admin.workit.co.ke
BETTER_AUTH_TRUSTED_ORIGINS=https://workit.co.ke,https://admin.workit.co.ke

# Internal API key (must match frontend/admin)
INTERNAL_API_KEY=<generate-a-secure-random-string>

# S3 / R2 storage
S3_ENDPOINT=<your-s3-endpoint>
S3_BUCKET=<your-bucket>
S3_REGION=auto
S3_ACCESS_KEY=<your-access-key>
S3_SECRET_KEY=<your-secret-key>
S3_FORCE_PATH_STYLE=false
S3_AUTO_CREATE_BUCKET=false
PUBLIC_MEDIA_URL=https://media.workit.co.ke/uploads

# Feature flags — all DDD modules active
USE_DDD_ORDER_MANAGEMENT=true
USE_DDD_CATALOG=true
USE_DDD_CUSTOMER=true
USE_DDD_MARKETING=true
USE_DDD_FULFILLMENT=true

# Node
NODE_ENV=production
LOG_LEVEL=info
PORT=3001
```

### 4.2 Frontend (Storefront)

**Resources → New → Application**

| Setting | Value |
|---------|-------|
| Name | `frontend` |
| Source | GitHub → `workit-ecommerce` |
| Server | localhost |
| Build Pack | Dockerfile |
| Dockerfile Location | `/Dockerfile.frontend` |
| Port | `3000` |
| Domains | `workit.co.ke` |

**Build Args** — the Dockerfile uses `ARG` statements that must be available during build. In Coolify, set these in the **Build** tab or prefix with `build.`:

```bash
NEXT_PUBLIC_BACKEND_URL=https://api.workit.co.ke
NEXT_PUBLIC_API_URL=https://api.workit.co.ke
BACKEND_URL=http://backend:3001
BACKEND_API_URL=http://backend:3001
INTERNAL_API_KEY=<same-as-backend>
REDIS_URL=redis://default:<REDIS_PASSWORD>@<REDIS_HOST>:6379
DATABASE_URL=postgresql://postgres:<POSTGRES_PASSWORD>@<POSTGRES_HOST>:5432/workit-db
```

**Environment Variables** (runtime):

```bash
# Auth
NEXT_PUBLIC_AUTH_BASE_URL=https://workit.co.ke
NEXT_PUBLIC_AUTH_BASE_PATH=/api/auth
NEXT_PUBLIC_AUTH_COOKIE_PREFIX=store-auth
BETTER_AUTH_URL=https://api.workit.co.ke
BETTER_AUTH_SECRET=<same-as-backend>
BETTER_AUTH_TRUSTED_ORIGINS=https://workit.co.ke,https://admin.workit.co.ke
NEXT_PUBLIC_AUTH_URL=https://workit.co.ke

# Media
NEXT_PUBLIC_MEDIA_URL=https://media.workit.co.ke

# SEO
NEXT_PUBLIC_FRONTEND_BASE_URL=https://workit.co.ke
INDEXNOW_SITE_URL=https://workit.co.ke
INDEXNOW_KEY=1362f663ee08495c823032577fefb4db

# OTP Email
OTP_FROM_EMAIL=no-reply@workit.co.ke
RESEND_API_KEY=<your-resend-key>
RESEND_FROM_EMAIL=no-reply@workit.co.ke

# Node
NODE_ENV=production
PORT=3000
```

> **Important:** The `NEXT_PUBLIC_*` vars are baked into the JS bundle at build time. If you change them, you must rebuild the frontend. All other env vars can be changed at runtime.

### 4.3 Admin Panel

**Resources → New → Application**

| Setting | Value |
|---------|-------|
| Name | `admin` |
| Source | GitHub → `workit-ecommerce` |
| Server | localhost |
| Build Pack | Dockerfile |
| Dockerfile Location | `/Dockerfile.admin` |
| Port | `3002` |
| Domains | `admin.workit.co.ke` |

**Build Args:**

```bash
DATABASE_URL=postgresql://postgres:<POSTGRES_PASSWORD>@<POSTGRES_HOST>:5432/workit-db
BACKEND_URL=http://backend:3001
NEXT_PUBLIC_BACKEND_URL=https://api.workit.co.ke
NEXT_PUBLIC_API_URL=https://api.workit.co.ke
STOREFRONT_URL=https://workit.co.ke
```

**Environment Variables:**

```bash
# Auth
BETTER_AUTH_SECRET=<same-as-backend>
BETTER_AUTH_URL=https://api.workit.co.ke
ADMIN_URL=https://admin.workit.co.ke
NEXT_PUBLIC_AUTH_BASE_URL=https://admin.workit.co.ke
NEXT_PUBLIC_AUTH_BASE_PATH=/api/auth
NEXT_PUBLIC_AUTH_COOKIE_PREFIX=admin-auth
NEXT_PUBLIC_ADMIN_BASE_URL=https://admin.workit.co.ke
BETTER_AUTH_TRUSTED_ORIGINS=https://workit.co.ke,https://admin.workit.co.ke

# URLs
NEXT_PUBLIC_BACKEND_URL=https://api.workit.co.ke
NEXT_PUBLIC_API_URL=https://api.workit.co.ke
BACKEND_API_URL=http://backend:3001
CORS_ORIGIN=https://workit.co.ke,https://admin.workit.co.ke

# Media
NEXT_PUBLIC_MEDIA_URL=https://media.workit.co.ke

# Node
NODE_ENV=production
PORT=3002
HOSTNAME=0.0.0.0
```

---

## 5. Internal Service Discovery

All Coolify services on the same server can reach each other via Docker's internal network using the Coolify-generated DNS names:

| Service | Coolify internal hostname |
|---------|--------------------------|
| PostgreSQL | `workit-db` (or `<uuid>.coolify`) |
| Redis | `workit-redis` (or `<uuid>.coolify`) |
| Typesense | `workit-typesense` (or `<uuid>.coolify`) |
| Backend | `backend` |
| Frontend | `frontend` |
| Admin | `admin` |

When configuring env vars, use these hostnames instead of `localhost` or IPs — they resolve on the Docker network.

---

## 6. SSL / Domains

Coolify auto-proxies via Caddy and issues Let's Encrypt certificates automatically.

### DNS records

Point all three domains to your **server IP**:

```
A  workit.co.ke       → <SERVER_IP>
A  admin.workit.co.ke → <SERVER_IP>
A  api.workit.co.ke   → <SERVER_IP>
```

### Coolify domain config

Under each **Resource → Domains**, add the domain. Coolify will:

- Configure the reverse proxy (Caddy)
- Issue SSL certificates automatically
- Redirect HTTP → HTTPS
- Handle WebSocket proxying (if needed)

---

## 7. Production Database Migrations

Coolify does **not** run DB migrations automatically. Apply schema changes after deploying new backend code.

### Option A: Exec into the running backend container (quickest)

```bash
docker exec -it <backend-container-id> sh
cd /app
pnpm --filter @workit/db build
pnpm --dir /app/backend db:push
exit
```

### Option B: Temporary migration service in Coolify

Create a **temporary resource**:

- **Type:** Application
- **Image:** `node:22-alpine`
- **Command:** `pnpm --filter @workit/db build && pnpm --dir /app/backend db:push`
- **Working Directory:** `/app`
- **Volumes:** copy the repo source (or better, deploy once from GitHub source)

Set `DATABASE_URL` env, deploy once, then delete the resource.

### Option C: GitHub Actions (automated)

Add a migration step to `.github/workflows/deploy.yml` that calls a Coolify webhook after building:

```yaml
- name: Run DB migration
  if: ${{ contains(needs.detect-changes.outputs.services, 'backend') }}
  run: |
    curl -X POST https://<your-domain>/api/v1/deploy \
      -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}" \
      -H "Content-Type: application/json" \
      -d '{"resourceUuid":"<migration-resource-uuid>","force":true}'
```

Create a migration "application" in Coolify (Dockerfile that runs the migration) and trigger it via API after backend builds.

---

## 8. Backups (using the 2 snapshots)

### Cloud provider snapshots

Schedule both included snapshots:

| Snapshot | Schedule | Retention | Purpose |
|----------|----------|-----------|---------|
| **Daily** | 02:00 UTC | 7 days | Point-in-time recovery |
| **Weekly** | Sunday 03:00 UTC | 4 weeks | Long-term recovery |

### Logical DB backup (cron)

In addition to snapshots, schedule a pg_dump to a backup directory:

```bash
# Add to crontab (crontab -e)
0 4 * * * docker exec workit-postgres pg_dump -U postgres workit-db | gzip > /var/backups/postgres/workit-db-$(date +\%Y\%m\%d).sql.gz && find /var/backups/postgres/ -name "*.sql.gz" -mtime +30 -delete
```

### Critical data checklist

Data that needs backup coverage:

| Data | Backup method |
|------|--------------|
| PostgreSQL data | Snapshot + pg_dump |
| Redis (cache) | Not critical — can rebuild |
| Typesense index | Can reindex from DB |
| S3 media files | Already redundant (Cloudflare R2) |
| Application code | In GitHub |

---

## 9. Monitoring

### Coolify built-in

- **Logs:** Real-time container logs for each resource
- **Restart policy:** Automatic restart on failure
- **Resource usage:** Basic CPU/memory per container

### Lightweight monitoring (optional)

If you want more visibility, deploy Prometheus + Node Exporter from `workit-monitoring/`:

```bash
cd workit-monitoring
docker compose up -d
```

This runs on port 3003 (Grafana) and 9090 (Prometheus).

With **~2.5 GB free headroom**, this monitoring stack adds negligible overhead (~300 MB).

---

## 10. Deployment Workflow

### Auto-deploy on git push

1. Push code to `main` on GitHub
2. GitHub Actions builds Docker images → pushes to GHCR
3. Coolify detects the new image → pulls and redeploys

### Manual deploy in Coolify UI

1. Go to the resource
2. Click **Deploy**
3. Choose **Deploy** (latest commit) or **Rollback** to a previous version

### Zero-downtime

Coolify supports rolling updates. The backend already handles graceful shutdown via Fastify's built-in signals. Ensure health check endpoints are configured:

```text
GET /health/live   → 200 if the app process is running
GET /health/ready  → 200 if the app is ready to serve requests
```

Add these as Coolify health check paths in each resource's settings.

---

## 11. Resource Capacity & Traffic Estimates

| Traffic Level | Concurrent Users | Peak RAM | Notes |
|---------------|-----------------|----------|-------|
| Low | 0–100 | ~6 GB | Snappy, plenty of headroom |
| Medium | 100–500 | ~8–9 GB | Comfortable, covers most ecommerce sites |
| High | 500–2,000 | ~10–11 GB | May approach limits; monitor swap usage |
| Peak burst | 2,000+ | >12 GB | Will swap; consider vertical scaling to 16 GB |

At **medium traffic**, you're well within spec. The NVMe storage (vs SSD) makes a real difference when PostgreSQL and Typesense are under load — writes and full-text searches benefit from the lower latency.

---

## 12. Environment Variable Quick Reference

### Backend (required)

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | From Coolify PostgreSQL resource |
| `REDIS_URL` | From Coolify Redis resource |
| `TYPESENSE_API_KEY` | Set when creating Typesense resource |
| `BETTER_AUTH_SECRET` | Generate via `openssl rand -hex 32` |
| `INTERNAL_API_KEY` | Generate via `openssl rand -hex 32` |
| `S3_ENDPOINT/ACCESS/SECRET` | From Cloudflare R2 / S3 provider |

### Cross-service shared secrets

These must be **identical** across services:

| Secret | Set in |
|--------|--------|
| `BETTER_AUTH_SECRET` | Backend + Frontend + Admin |
| `INTERNAL_API_KEY` | Backend + Frontend |
| `POSTGRES_PASSWORD` | PostgreSQL backend + app connection strings |
| `REDIS_PASSWORD` | Redis + app connection string |
| `TYPESENSE_API_KEY` | Typesense + Backend |

---

## 13. Troubleshooting

### "column does not exist"

Your deployed backend code expects a newer DB schema. Run the migration:

```bash
docker exec <backend-container> sh -c "cd /app && pnpm --filter @workit/db build && pnpm --dir /app/backend db:push"
```

### Frontend build fails with DB connection error

The Dockerfile sets `SKIP_DB_CHECK=true` for this reason. Check that this env var is present during build.

### Auth cookies not working

- Ensure `BETTER_AUTH_TRUSTED_ORIGINS` includes both storefront and admin domains
- Frontend uses cookie prefix `store-auth`, admin uses `admin-auth` — they don't conflict
- Both use `/api/auth` path — cookie path isolation handles this

### Cross-origin errors in browser

- `CORS_ORIGIN` on the backend must list all frontend origins
- `NEXT_PUBLIC_BACKEND_URL` must be the public HTTPS URL, not internal

### High memory usage

Check if the backend's search reindex is running (`TYPESENSE_REINDEX_INTERVAL_MS`). If memory is tight, increase the interval or run reindex during off-peak hours.

---

## 14. Commands Cheatsheet

```bash
# SSH into server
ssh deploy@<SERVER_IP>

# Check all running containers
docker ps

# View Coolify logs
docker logs coolify --tail 100 -f

# Exec into a service container
docker exec -it <container-name> sh

# Check PostgreSQL health
docker exec workit-postgres pg_isready -U postgres

# Run DB migration manually
docker exec workit-postgres sh -c "cd /app && pnpm --filter @workit/db build && pnpm --dir /app/backend db:push"

# Check disk usage
df -h

# Check memory usage
free -h

# List Coolify-managed resources
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```
