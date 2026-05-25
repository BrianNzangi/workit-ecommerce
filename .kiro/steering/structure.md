# Workit Ecommerce - Project Structure

## Monorepo Layout

```
workit-ecommerce/
├── frontend/              # Next.js storefront (workit.co.ke)
├── admin/                 # Next.js admin panel (admin.workit.co.ke)
├── backend/               # Fastify API (api.workit.co.ke)
├── backend-v2/            # DDD architecture backend (experimental)
├── packages/
│   ├── db/                # Drizzle schema, migrations, seed scripts
│   ├── validation/        # Shared Zod schemas and types
│   └── api/               # API client definitions
├── docs/                  # Documentation
├── .kiro/                 # Kiro AI assistant configuration
│   ├── specs/             # Feature and bugfix specs
│   └── steering/          # Steering documents (this folder)
├── .agent/                # Agent hooks and workflows
├── .turbo/                # Turbo cache
├── .pnpm-store/           # pnpm store
├── docker-compose.yml     # Infrastructure containers
├── turbo.json             # Turbo configuration
├── pnpm-workspace.yaml    # Workspace configuration
└── package.json           # Root package.json
```

## Backend Structure (`backend/src/`)

```
backend/src/
├── app.ts                 # Fastify app setup
├── server.ts              # Server entry point
├── db/                    # Database utilities
├── lib/                   # Shared utilities
├── modules/               # Feature modules (DDD)
├── plugins/               # Fastify plugins
└── services/              # Business logic services
```

## Frontend Structure (`frontend/src/`)

```
frontend/src/
├── app/                   # Next.js App Router pages
├── components/            # Reusable UI components
├── data/                  # Data fetching utilities
├── hooks/                 # Custom React hooks
├── lib/                   # Shared utilities
├── store/                 # Zustand state management
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Admin Structure (`admin/src/`)

```
admin/src/
├── app/                   # Next.js App Router pages
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                 # Shared utilities
├── store/                 # State management
└── types/                 # TypeScript type definitions
```

## Shared Packages

### `packages/db/`
- `src/schema/` - Drizzle ORM schema definitions
- `src/migrations/` - Database migrations
- `src/seed.ts` - Seed script
- `drizzle.config.ts` - Drizzle CLI configuration

### `packages/validation/`
- Shared Zod schemas for request/response validation
- Type definitions used across backend and frontend

### `packages/api/`
- API client definitions
- Type-safe API calls

## Key Conventions

1. **Database**: Use Drizzle ORM for all database operations. Never write raw SQL in application code.

2. **Validation**: Use Zod schemas from `@workit/validation` for all input validation.

3. **Authentication**: Use Better Auth for session management. Cookie prefixes separate admin (`admin-auth`) and storefront (`store-auth`) sessions.

4. **Media**: Uploads stored in MinIO, served via `/uploads/:filename`. Production uses CDN at `media.workit.co.ke`.

5. **Schema Changes**: 
   - Development: `DB_AUTO_PUSH=true` auto-applies schema
   - Production: Manual `db:push` required via SSH

6. **Build Order**: Backend depends on `@workit/db` and `@workit/validation`. Frontend depends on `@workit/api`, `@workit/db`, and `@workit/validation`.

7. **Port Convention**: 
   - Storefront: 3000
   - Backend: 3001
   - Admin: 3002