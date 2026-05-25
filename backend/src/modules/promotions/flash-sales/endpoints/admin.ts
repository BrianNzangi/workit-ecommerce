import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, and, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const flashSalesAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Flash Sales
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request) => {
        const { limit = 50, offset = 0, status, q } = request.query as any;

        let whereClause;
        if (status && q) {
            whereClause = and(
                eq(schema.flashSales.status, status),
                ilike(schema.flashSales.title, `%${q}%`)
            );
        } else if (status) {
            whereClause = eq(schema.flashSales.status, status);
        } else if (q) {
            whereClause = ilike(schema.flashSales.title, `%${q}%`);
        }

        const flashSales = await db.query.flashSales.findMany({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            orderBy: [desc(schema.flashSales.createdAt)],
            with: {
                products: { with: { product: true } }
            }
        });

        return {
            flashSales: flashSales.map((f: any) => ({
                ...f,
                productIds: f.products?.map((p: any) => p.productId) || [],
                productsCount: f.products?.length || 0
            })),
            success: true
        };
    });

    // Create Flash Sale
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request, reply) => {
        const body = request.body as any;
        const { title, discount, startDate, endDate, status, productIds } = body;

        const id = uuidv4();
        const now = new Date();

        const [flashSale] = await db.insert(schema.flashSales).values({
            id,
            title,
            discount: Number(discount),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: status || 'DRAFT',
            createdAt: now,
            updatedAt: now
        }).returning();

        // Add products
        if (productIds && Array.isArray(productIds) && productIds.length > 0) {
            const productRecords = productIds.map((productId: string) => ({
                id: uuidv4(),
                flashSaleId: id,
                productId
            }));
            await db.insert(schema.flashSaleProducts).values(productRecords);
        }

        await fastify.cache.invalidateTags(["flash-sales", "promotions"]);
        return { flashSale, success: true };
    });

    // Get Flash Sale
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const flashSale = await db.query.flashSales.findFirst({
            where: eq(schema.flashSales.id, id),
            with: {
                products: { with: { product: true } }
            }
        });
        if (!flashSale) return reply.status(404).send({ message: "Flash sale not found" });
        return {
            flashSale: {
                ...flashSale,
                productIds: flashSale.products?.map((p: any) => p.productId) || []
            },
            success: true
        };
    });

    // Update Flash Sale
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const body = request.body as any;
        const { title, discount, startDate, endDate, status, productIds } = body;

        const [flashSale] = await db.update(schema.flashSales).set({
            ...(title && { title }),
            ...(discount !== undefined && { discount: Number(discount) }),
            ...(startDate && { startDate: new Date(startDate) }),
            ...(endDate && { endDate: new Date(endDate) }),
            ...(status && { status }),
            updatedAt: new Date()
        }).where(eq(schema.flashSales.id, id)).returning();

        if (!flashSale) return reply.status(404).send({ message: "Flash sale not found" });

        // Update products
        if (productIds !== undefined) {
            await db.delete(schema.flashSaleProducts).where(eq(schema.flashSaleProducts.flashSaleId, id));
            if (Array.isArray(productIds) && productIds.length > 0) {
                const productRecords = productIds.map((productId: string) => ({
                    id: uuidv4(),
                    flashSaleId: id,
                    productId
                }));
                await db.insert(schema.flashSaleProducts).values(productRecords);
            }
        }

        await fastify.cache.invalidateTags(["flash-sales", "promotions"]);
        return { flashSale, success: true };
    });

    // Delete Flash Sale
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.flashSales).where(eq(schema.flashSales.id, id));
        await fastify.cache.invalidateTags(["flash-sales", "promotions"]);
        return { success: true };
    });

    // Bulk Delete
    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request) => {
        const { ids } = request.body as any;
        if (!Array.isArray(ids) || ids.length === 0) return { success: false };
        await db.delete(schema.flashSales).where(inArray(schema.flashSales.id, ids));
        await fastify.cache.invalidateTags(["flash-sales", "promotions"]);
        return { success: true, count: ids.length };
    });
};

export default flashSalesAdminRoutes;
