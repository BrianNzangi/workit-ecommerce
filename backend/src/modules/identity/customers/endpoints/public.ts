import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc } from "../../../../lib/db.js";

export const customersPublicRoutes: FastifyPluginAsync = async (fastify) => {
    // Show Me (Customer Profile)
    fastify.get("/me", {
        schema: {
            tags: ["Customers"]
        },
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        const user = request.user as any;
        if (!user || !user.id) return reply.status(401).send({ message: "Unauthorized" });

        const customer = await db.query.users.findFirst({
            where: eq(schema.users.id, user.id),
        });

        return customer;
    });

    // My Addresses
    fastify.get("/me/addresses", {
        schema: {
            tags: ["Customers"]
        },
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        const user = request.user as any;
        if (!user || !user.id) return reply.status(401).send({ message: "Unauthorized" });

        const results = await db.query.addresses.findMany({
            where: eq(schema.addresses.customerId, user.id),
        });
        return { addresses: results };
    });

    // My Orders
    fastify.get("/me/orders", {
        schema: {
            tags: ["Customers"]
        },
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        const user = request.user as any;
        if (!user || !user.id) return reply.status(401).send({ message: "Unauthorized" });

        const results = await db.query.orders.findMany({
            where: eq(schema.orders.customerId, user.id),
            orderBy: [desc(schema.orders.createdAt)],
            with: {
                lines: { with: { product: true } }
            }
        });
        return { orders: results };
    });
};

export default customersPublicRoutes;

