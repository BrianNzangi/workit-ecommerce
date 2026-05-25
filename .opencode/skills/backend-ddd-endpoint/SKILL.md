---
name: backend-ddd-endpoint
description: Create Fastify admin CRUD endpoints with Drizzle and DDD patterns
compatibility: opencode
metadata:
  framework: fastify
  orm: drizzle
  project: workit-ecommerce
---

## What I do

Generate Fastify route handlers for admin CRUD operations using Drizzle ORM with consistent patterns — authentication, permission checks, pagination, filtering, and DDD aggregate integration.

## When to use me

Use this when creating new backend admin routes under `backend/src/modules/`.

## File structure

```
backend/src/modules/<domain>/<entity>/
  index.ts              — register sub-routes
  endpoints/
    admin.ts            — admin CRUD routes
    public.ts           — (optional) storefront routes
```

## Endpoint template

```ts
import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, and, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const entityAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // LIST
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('domain.action')]
    }, async (request) => {
        const { limit = 50, offset = 0, status, q } = request.query as any;
        let whereClause;
        if (status && q) whereClause = and(eq(schema.table.status, status), ilike(schema.table.title, `%${q}%`));
        else if (status) whereClause = eq(schema.table.status, status);
        else if (q) whereClause = ilike(schema.table.title, `%${q}%`);

        const items = await db.query.table.findMany({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            orderBy: [desc(schema.table.createdAt)],
            with: { product: true }
        });

        return { items: items.map(i => ({ ...i, productName: i.product?.name || null })), success: true };
    });

    // CREATE
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('domain.action')]
    }, async (request, reply) => {
        const body = request.body as any;
        const id = uuidv4();
        const [record] = await db.insert(schema.table).values({ id, ...body, createdAt: new Date(), updatedAt: new Date() }).returning();
        return { record, success: true };
    });

    // GET
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('domain.action')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const record = await db.query.table.findFirst({ where: eq(schema.table.id, id), with: { product: true } });
        if (!record) return reply.status(404).send({ message: "Not found" });
        return { record, success: true };
    });

    // UPDATE
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('domain.action')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const body = request.body as any;
        const [record] = await db.update(schema.table).set({ ...body, updatedAt: new Date() }).where(eq(schema.table.id, id)).returning();
        if (!record) return reply.status(404).send({ message: "Not found" });
        return { record, success: true };
    });

    // DELETE
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('domain.action')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        await db.delete(schema.table).where(eq(schema.table.id, id));
        return { success: true };
    });

    // BULK DELETE
    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('domain.action')]
    }, async (request) => {
        const { ids } = request.body as any;
        await db.delete(schema.table).where(inArray(schema.table.id, ids));
        return { success: true };
    });
};
```

## Permission names

| Module | Permission |
|--------|-----------|
| Orders | `orders.manage` |
| Catalog | `catalog.manage` |
| Customers | `customers.manage` |
| Promotions | `promotions.manage` |
| Marketing content | `marketing.content.manage` |
| Analytics | `analytics.view` |
| Shipping | `shipping.manage` |
| Settings | `settings.manage` |
| Users | `users.manage` |

## Module registration

In `backend/src/modules/index.ts`:
```ts
await fastify.register(entityRoutes, { prefix: "/domain" });
await fastify.register(entityRoutes, { prefix: "/api/domain" });  // backward-compat
```

In `backend/src/modules/<domain>/index.ts`:
```ts
await fastify.register(adminRoutes, { prefix: "/admin" });
```

## References

- Full example: `backend/src/modules/promotions/coupons/endpoints/admin.ts`
- Module index: `backend/src/modules/promotions/coupons/index.ts`
- Registration: `backend/src/modules/promotions/index.ts` + `backend/src/modules/index.ts`
