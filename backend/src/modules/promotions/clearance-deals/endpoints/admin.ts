import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, and, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const clearanceDealsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Clearance Deals
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request) => {
        const { limit = 50, offset = 0, status, q, deal } = request.query as any;

        const conditions = [];
        if (status) conditions.push(eq(schema.clearanceDeals.status, status));
        if (q) conditions.push(ilike(schema.clearanceDeals.title, `%${q}%`));
        if (deal) conditions.push(eq(schema.clearanceDeals.deal, deal));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const clearanceDeals = await db.query.clearanceDeals.findMany({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            orderBy: [desc(schema.clearanceDeals.createdAt)],
            with: {
                product: true
            }
        });

        return {
            clearanceDeals: clearanceDeals.map(c => ({
                ...c,
                productName: c.product?.name || null
            })),
            success: true
        };
    });

    // Create Clearance Deal
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request, reply) => {
        const body = request.body as any;
        const { productId, title, discount, type, deal, startDate, endDate, status } = body;

        const id = uuidv4();
        const now = new Date();

        const [clearanceDeal] = await db.insert(schema.clearanceDeals).values({
            id,
            productId,
            title,
            discount: Number(discount),
            type: type || 'Promo',
            deal,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: status || 'DRAFT',
            createdAt: now,
            updatedAt: now
        }).returning();

        await fastify.cache.invalidateTags(["clearance-deals", "promotions"]);
        return { clearanceDeal, success: true };
    });

    // Get Clearance Deal
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const clearanceDeal = await db.query.clearanceDeals.findFirst({
            where: eq(schema.clearanceDeals.id, id),
            with: {
                product: true
            }
        });
        if (!clearanceDeal) return reply.status(404).send({ message: "Clearance deal not found" });
        return { clearanceDeal, success: true };
    });

    // Update Clearance Deal
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const body = request.body as any;
        const { productId, title, discount, type, deal, startDate, endDate, status } = body;

        const [clearanceDeal] = await db.update(schema.clearanceDeals).set({
            ...(productId && { productId }),
            ...(title && { title }),
            ...(discount !== undefined && { discount: Number(discount) }),
            ...(type && { type }),
            ...(deal && { deal }),
            ...(startDate && { startDate: new Date(startDate) }),
            ...(endDate && { endDate: new Date(endDate) }),
            ...(status && { status }),
            updatedAt: new Date()
        }).where(eq(schema.clearanceDeals.id, id)).returning();

        if (!clearanceDeal) return reply.status(404).send({ message: "Clearance deal not found" });

        await fastify.cache.invalidateTags(["clearance-deals", "promotions"]);
        return { clearanceDeal, success: true };
    });

    // Delete Clearance Deal
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.clearanceDeals).where(eq(schema.clearanceDeals.id, id));
        await fastify.cache.invalidateTags(["clearance-deals", "promotions"]);
        return { success: true };
    });

    // Bulk Delete
    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request) => {
        const { ids } = request.body as any;
        if (!Array.isArray(ids) || ids.length === 0) return { success: false };
        await db.delete(schema.clearanceDeals).where(inArray(schema.clearanceDeals.id, ids));
        await fastify.cache.invalidateTags(["clearance-deals", "promotions"]);
        return { success: true, count: ids.length };
    });
};

export default clearanceDealsAdminRoutes;
