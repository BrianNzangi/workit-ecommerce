# Workit Ecommerce - Technology Stack

## Build System

- **Monorepo**: pnpm workspace
- **Build Orchestrator**: Turbo
- **Package Manager**: pnpm@10.28.2

## Tech Stack

### Backend
- **Framework**: Fastify v5
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Validation**: Zod
- **File Uploads**: @fastify/multipart
- **Storage**: AWS SDK S3 client (MinIO)
- **Caching**: ioredis (Redis)
- **JWT**: @fastify/jwt
- **API Documentation**: Swagger/OpenAPI (@fastify/swagger)

### Frontend (Storefront)
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React, Solar Icons
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Notifications**: Sonner, React Hot Toast
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Carousel**: Swiper

### Admin Panel
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **State Management**: React Query, Zustand
- **HTTP Client**: Apollo Client (GraphQL)
- **Forms**: Radix UI primitives
- **Notifications**: Sonner
- **Rich Text Editor**: Tiptap
- **Charts**: Recharts
- **Icons**: Lucide React

### Shared Packages
- **@workit/db**: Drizzle schema, migrations, seed scripts
- **@workit/validation**: Shared Zod schemas and types
- **@workit/api**: API client definitions

## Common Commands

### Development
```bash
# Start all services (frontend:3000, backend:3001, admin:3002)
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint
```

### Database
```bash
# Push schema to local database
pnpm db:push

# Run Drizzle Studio
pnpm db:studio

# Generate migrations
pnpm --filter @workit/db generate

# Run migrations
pnpm --filter @workit/db migrate

# Run seed script
pnpm --filter @workit/db seed
```

### Individual Services
```bash
# Backend only
pnpm --filter @workit/backend dev

# Frontend only
pnpm --filter @workit/frontend dev

# Admin only
pnpm --filter @workit/admin dev
```

### Docker
```bash
# Start infrastructure (Postgres, MinIO, backend) in containers
docker compose up --build
```

## TypeScript Configuration

- **Target**: ESNext (backend), ES2017 (frontend/admin)
- **Module**: NodeNext (backend), esnext (frontend/admin)
- **Strict**: true across all packages
- **Module Resolution**: NodeNext (backend), bundler (frontend)

## Environment Variables

Key variables (see `.env.example` for full list):
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret
- `BETTER_AUTH_URL` - Backend URL for auth callbacks
- `CORS_ORIGIN` - Allowed frontend/admin origins
- `PORT` - Backend port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `DB_AUTO_PUSH` - Auto-push schema on startup (dev only)
- `ALGOLIA_*` - Optional search configuration