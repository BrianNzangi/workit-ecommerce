import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, and, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const couponsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Coupons
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request) => {
        const { limit = 50, offset = 0, status, q } = request.query as any;

        let whereClause;
        if (status && q) {
            whereClause = and(
                eq(schema.coupons.status, status),
                ilike(schema.coupons.title, `%${q}%`)
            );
        } else if (status) {
            whereClause = eq(schema.coupons.status, status);
        } else if (q) {
            whereClause = ilike(schema.coupons.title, `%${q}%`);
        }

        const coupons = await db.query.coupons.findMany({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            orderBy: [desc(schema.coupons.createdAt)],
            with: {
                bannerImage: true,
                products: { with: { product: true } }
            }
        });

        // Get stats
        const totalCount = await db.$count(schema.coupons);
        const activeCount = await db.$count(schema.coupons, eq(schema.coupons.status, 'ACTIVE'));
        const expiredCount = await db.$count(schema.coupons, eq(schema.coupons.status, 'EXPIRED'));
        const totalUserUsed = await db.$count(schema.coupons, eq(schema.coupons.userLimit, 0));

        return {
            coupons: coupons.map((c: any) => ({
                ...c,
                productIds: c.products?.map((p: any) => p.productId) || [],
                productsCount: c.products?.length || 0
            })),
            stats: {
                totalCoupons: totalCount,
                activeCoupons: activeCount,
                expiredCoupons: expiredCount,
                totalUserUsed
            },
            success: true
        };
    });

    // Create Coupon
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request, reply) => {
        const body = request.body as any;
        const { title, bannerImageId, couponAmount, minAmount, userLimit, startDate, endDate, description, status, productIds } = body;

        const id = uuidv4();
        const now = new Date();
        const generatedCode = `CPN-${id.slice(0, 8).toUpperCase()}`;

        const [coupon] = await db.insert(schema.coupons).values({
            id,
            title,
            code: generatedCode,
            bannerImageId: bannerImageId || null,
            couponAmount: Number(couponAmount),
            minAmount: Number(minAmount) || 0,
            userLimit: Number(userLimit) || 0,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            description: description || null,
            status: status || 'DRAFT',
            createdAt: now,
            updatedAt: now
        }).returning();

        // Add products
        if (productIds && Array.isArray(productIds) && productIds.length > 0) {
            const productRecords = productIds.map((productId: string) => ({
                id: uuidv4(),
                couponId: id,
                productId
            }));
            await db.insert(schema.couponProducts).values(productRecords);
        }

        await fastify.cache.invalidateTags(["promotions"]);
        return { coupon, success: true };
    });

    // Get Coupon
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const coupon = await db.query.coupons.findFirst({
            where: eq(schema.coupons.id, id),
            with: {
                bannerImage: true,
                products: { with: { product: true } }
            }
        });
        if (!coupon) return reply.status(404).send({ message: "Coupon not found" });
        return {
            coupon: {
                ...coupon,
                productIds: coupon.products?.map((p: any) => p.productId) || []
            },
            success: true
        };
    });

    // Update Coupon
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const body = request.body as any;
        const { title, bannerImageId, couponAmount, minAmount, userLimit, startDate, endDate, description, status, productIds } = body;

        const [coupon] = await db.update(schema.coupons).set({
            ...(title && { title }),
            ...(bannerImageId !== undefined && { bannerImageId }),
            ...(couponAmount !== undefined && { couponAmount: Number(couponAmount) }),
            ...(minAmount !== undefined && { minAmount: Number(minAmount) }),
            ...(userLimit !== undefined && { userLimit: Number(userLimit) }),
            ...(startDate && { startDate: new Date(startDate) }),
            ...(endDate && { endDate: new Date(endDate) }),
            ...(description !== undefined && { description }),
            ...(status && { status }),
            updatedAt: new Date()
        }).where(eq(schema.coupons.id, id)).returning();

        if (!coupon) return reply.status(404).send({ message: "Coupon not found" });

        // Update products
        if (productIds !== undefined) {
            await db.delete(schema.couponProducts).where(eq(schema.couponProducts.couponId, id));
            if (Array.isArray(productIds) && productIds.length > 0) {
                const productRecords = productIds.map((productId: string) => ({
                    id: uuidv4(),
                    couponId: id,
                    productId
                }));
                await db.insert(schema.couponProducts).values(productRecords);
            }
        }

        await fastify.cache.invalidateTags(["promotions"]);
        return { coupon, success: true };
    });

    // Delete Coupon
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.coupons).where(eq(schema.coupons.id, id));
        await fastify.cache.invalidateTags(["promotions"]);
        return { success: true };
    });

    // Bulk Delete
    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('promotions.manage')]
    }, async (request) => {
        const { ids } = request.body as any;
        if (!Array.isArray(ids) || ids.length === 0) return { success: false };
        await db.delete(schema.coupons).where(inArray(schema.coupons.id, ids));
        await fastify.cache.invalidateTags(["promotions"]);
        return { success: true, count: ids.length };
    });
};

export default couponsAdminRoutes;
