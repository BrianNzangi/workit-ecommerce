import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc } from "../../../../lib/db.js";

export const ordersPublicRoutes: FastifyPluginAsync = async (fastify) => {
    // List My Orders (Protected by generic auth, but public facing)
    fastify.get("/", {
        schema: {
            tags: ["Fulfillment"]
        },
        preHandler: [fastify.authenticate]
    }, async (request) => {
        // Assuming user is attached to request
        const user = request.user as any;
        if (!user || !user.id) return { orders: [] };

        // If user is a customer, find their orders
        // Note: This logic depends on how user/customer relationship is modeled.
        // For now, assuming user.id is the key or we look up customer by user id.

        const results = await db.query.orders.findMany({
            where: eq(schema.orders.customerId, user.id), // Simplified
            orderBy: [desc(schema.orders.createdAt)],
            with: {
                lines: { with: { product: true } }
            }
        });
        return { orders: results };
    });

    // Show Order
    fastify.get("/:id", {
        schema: {
            tags: ["Fulfillment"]
        },
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const user = request.user as any;

        const order = await db.query.orders.findFirst({
            where: eq(schema.orders.id, id),
            with: {
                lines: { with: { product: true } }
            }
        });

        if (!order) return reply.status(404).send({ message: "Order not found" });
        // basic security check
        if (order.customerId !== user.id) return reply.status(403).send({ message: "Unauthorized" });

        return order;
    });
};

export default ordersPublicRoutes;

