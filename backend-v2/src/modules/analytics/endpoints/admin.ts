import { FastifyPluginAsync } from "fastify";
import { db, schema, desc, sql } from "../../../lib/db.js";

export const analyticsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // Apply admin protection to all routes in this plugin
    fastify.addHook("preHandler", fastify.authenticate);
    fastify.addHook("preHandler", fastify.authorize(['SUPER_ADMIN', 'ADMIN']));

    fastify.get("/weekly-stats", async () => {
        // Mocking stats for now based on available data
        const [orderCount] = await db.select({ count: sql`count(*)` }).from(schema.orders);
        const [productCount] = await db.select({ count: sql`count(*)` }).from(schema.products);
        const [customerCount] = await db.select({ count: sql`count(*)` }).from(schema.users);

        return {
            orders: Number(orderCount?.count || 0),
            products: Number(productCount?.count || 0),
            customers: Number(customerCount?.count || 0),
            revenue: 0 // Will implement later
        };
    });

    fastify.get("/weekly-chart", async () => {
        return { data: [] }; // Mock
    });

    fastify.get("/sales-stats", async () => {
        return { totalSales: 0, growth: 0 }; // Mock
    });

    fastify.get("/recent-orders", async () => {
        const results = await db.query.orders.findMany({
            limit: 5,
            orderBy: [desc(schema.orders.createdAt)],
            with: { customer: true }
        });
        return { orders: results };
    });
};

export default analyticsAdminRoutes;
