---
name: promotion-module
description: Create full promotion CRUD with DDD backend and admin UI
compatibility: opencode
metadata:
  project: workit-ecommerce
  domain: promotions
---

## What I do

Create all layers of a promotion module (Coupon, Flash Sale, Featured Deal, Clearance Deal):
1. DB schema & enums
2. DDD aggregate, repository interface, mapper, repository implementation
3. Fastify admin endpoints
4. Module index & registration
5. Admin list + new/edit pages

## When to use me

Use this when adding a new promotion type to the Promotions section.

## File structure to create/modify

### 1. DB Schema — `packages/db/src/schema/promotions.ts`

- Define `pgEnum` for status, deal type, etc.
- Define `pgTable` with columns and indexes
- Add relations in `packages/db/src/schema/relations.ts`

### 2. DDD Aggregate — `backend/src/domain/promotions/aggregates/<Name>.ts`

- Export shared types (`PromotionStatus`, `DealType`, `ClearanceDealSource`)
- Define `Props` interface
- Extend `AggregateRoot<string>`
- Static `create()`, `reconstitute()`, getters

### 3. DDD Aggregate index — `backend/src/domain/promotions/aggregates/index.ts`

- Re-export all aggregates (watch for duplicate type exports — use explicit re-exports to avoid ambiguity)

### 4. Repository Interface — `backend/src/domain/promotions/repositories/I<Name>Repository.ts`

- `findById`, `findAll`, `save`, `delete`

### 5. Mapper — `backend/src/infrastructure/persistence/mappers/<Name>Mapper.ts`

- `toDomain(persistence)` — DB row → Aggregate
- `toPersistence(domain)` — Aggregate → DB row
- `toProductPersistence(domain)` — Junction table rows (if applicable)

### 6. Repository — `backend/src/infrastructure/persistence/repositories/<Name>Repository.ts`

- Implements interface
- Uses `db.query` with `where`, `with` relations
- Enum columns need typed values (cast string to enum)
- `save()` uses `onConflictDoUpdate` + deletes/re-inserts junction rows

### 7. Admin Endpoints — `backend/src/modules/promotions/<name>/endpoints/admin.ts`

```ts
fastify.get("/", { preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')] }, async (request) => { ... });
fastify.post("/", { ... } , async (request, reply) => { ... });
fastify.get("/:id", { ... }, async (request, reply) => { ... });
fastify.put("/:id", { ... }, async (request, reply) => { ... });
fastify.delete("/:id", { ... }, async (request, reply) => { ... });
fastify.post("/bulk-delete", { ... }, async (request, reply) => { ... });
```

- Use `v4 as uuidv4` from `uuid`
- Import `db, schema, eq, desc, ilike, and, inArray` from `../../../../lib/db.js`
- Return `{ <items>, success: true }`

### 8. Module Index — `backend/src/modules/promotions/<name>/index.ts`

```ts
import { FastifyPluginAsync } from "fastify";
import { <name>AdminRoutes } from "./endpoints/admin.js";
export default async (fastify) => {
  await fastify.register(<name>AdminRoutes, { prefix: "/admin" });
};
```

### 9. Promotions Index — `backend/src/modules/promotions/index.ts`

Register the new sub-module with its prefix.

### 10. Backend Module Registration — `backend/src/modules/index.ts`

```ts
await fastify.register(promotionsRoutes, { prefix: "/promotions" });
await fastify.register(promotionsRoutes, { prefix: "/api/promotions" });
```

### 11. Admin List Page — `admin/src/app/admin/promotions/<name>/page.tsx`

- Fetch from `/api/promotions/<name>/admin`
- Search, filter drawer (status), bulk delete, pagination
- shadcn mira style

### 12. Admin New Page — `admin/src/app/admin/promotions/<name>/new/page.tsx`

- Calendar popovers for dates, product search/table
- Follow `admin-page-mira` conventions

## RBAC

Add `"promotions.manage"` to `backend/src/lib/rbac.ts` permissions array and the ADMIN role defaults.

## Migration

After schema changes, create migration SQL in `packages/db/drizzle/` and run it against the database.

## References

- Full coupon module: `backend/src/modules/promotions/coupons/`
- Admin coupon pages: `admin/src/app/admin/promotions/coupons/`
