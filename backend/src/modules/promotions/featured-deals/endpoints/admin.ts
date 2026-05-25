import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, and, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const featuredDealsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Featured Deals
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request) => {
        const { limit = 50, offset = 0, status, q } = request.query as any;

        let whereClause;
        if (status && q) {
            whereClause = and(
                eq(schema.featuredDeals.status, status),
                ilike(schema.featuredDeals.title, `%${q}%`)
            );
        } else if (status) {
            whereClause = eq(schema.featuredDeals.status, status);
        } else if (q) {
            whereClause = ilike(schema.featuredDeals.title, `%${q}%`);
        }

        const featuredDeals = await db.query.featuredDeals.findMany({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            orderBy: [desc(schema.featuredDeals.createdAt)],
            with: {
                product: true
            }
        });

        return {
            featuredDeals: featuredDeals.map((f: any) => ({
                ...f,
                productName: f.product?.name || null
            })),
            success: true
        };
    });

    // Create Featured Deal
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request, reply) => {
        const body = request.body as any;
        const { productId, title, discount, dealType, startDate, endDate, status } = body;

        const id = uuidv4();
        const now = new Date();

        const [featuredDeal] = await db.insert(schema.featuredDeals).values({
            id,
            productId,
            title,
            discount: Number(discount),
            dealType: dealType || 'PROMO',
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: status || 'DRAFT',
            createdAt: now,
            updatedAt: now
        }).returning();

        await fastify.cache.invalidateTags(["featured-deals", "promotions"]);
        return { featuredDeal, success: true };
    });

    // Get Featured Deal
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const featuredDeal = await db.query.featuredDeals.findFirst({
            where: eq(schema.featuredDeals.id, id),
            with: {
                product: true
            }
        });
        if (!featuredDeal) return reply.status(404).send({ message: "Featured deal not found" });
        return { featuredDeal, success: true };
    });

    // Update Featured Deal
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const body = request.body as any;
        const { productId, title, discount, dealType, startDate, endDate, status } = body;

        const [featuredDeal] = await db.update(schema.featuredDeals).set({
            ...(productId && { productId }),
            ...(title && { title }),
            ...(discount !== undefined && { discount: Number(discount) }),
            ...(dealType && { dealType }),
            ...(startDate && { startDate: new Date(startDate) }),
            ...(endDate && { endDate: new Date(endDate) }),
            ...(status && { status }),
            updatedAt: new Date()
        }).where(eq(schema.featuredDeals.id, id)).returning();

        if (!featuredDeal) return reply.status(404).send({ message: "Featured deal not found" });

        await fastify.cache.invalidateTags(["featured-deals", "promotions"]);
        return { featuredDeal, success: true };
    });

    // Delete Featured Deal
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.featuredDeals).where(eq(schema.featuredDeals.id, id));
        await fastify.cache.invalidateTags(["featured-deals", "promotions"]);
        return { success: true };
    });

    // Bulk Delete
    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request) => {
        const { ids } = request.body as any;
        if (!Array.isArray(ids) || ids.length === 0) return { success: false };
        await db.delete(schema.featuredDeals).where(inArray(schema.featuredDeals.id, ids));
        await fastify.cache.invalidateTags(["featured-deals", "promotions"]);
        return { success: true, count: ids.length };
    });
};

export default featuredDealsAdminRoutes;
