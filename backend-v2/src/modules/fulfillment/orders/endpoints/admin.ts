import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const ordersAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List All Orders
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { limit = 50, offset = 0 } = request.query as any;
        const results = await db.query.orders.findMany({
            limit: Number(limit),
            offset: Number(offset),
            orderBy: [desc(schema.orders.createdAt)],
            with: {
                customer: true,
                lines: { with: { product: true } }
            }
        });
        return { orders: results, success: true };
    });

    // Search Orders
    fastify.get("/search", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { q } = request.query as any;
        const results = await db.query.orders.findMany({
            where: ilike(schema.orders.id, `%${q}%`),
            with: { customer: true }
        });
        return { orders: results, success: true };
    });

    // Show Order
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const order = await db.query.orders.findFirst({
            where: eq(schema.orders.id, id),
            with: {
                customer: true,
                lines: { with: { product: true } }
            }
        });
        if (!order) return reply.status(404).send({ message: "Order not found" });
        return { order, success: true };
    });

    // Update Order Status
    fastify.patch("/:id/status", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const { state } = request.body as any;
        const [order] = await db.update(schema.orders).set({ state, updatedAt: new Date() }).where(eq(schema.orders.id, id)).returning();
        if (!order) return reply.status(404).send({ message: "Order not found" });
        return { order, success: true };
    });

    // Update Order (General)
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const data = request.body as any;
        const [order] = await db.update(schema.orders).set({ ...data, updatedAt: new Date() }).where(eq(schema.orders.id, id)).returning();
        if (!order) return reply.status(404).send({ message: "Order not found" });
        return { order, success: true };
    });

    // Delete Order
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.orders).where(eq(schema.orders.id, id));
        return { success: true };
    });

    // Bulk Delete
    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { ids } = request.body as any;
        if (!Array.isArray(ids) || ids.length === 0) return { success: false };
        await db.delete(schema.orders).where(inArray(schema.orders.id, ids));
        return { success: true, count: ids.length };
    });
};

export default ordersAdminRoutes;

