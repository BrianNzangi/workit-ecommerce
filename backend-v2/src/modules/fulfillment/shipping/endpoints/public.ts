import { FastifyPluginAsync } from "fastify";
import { db, schema, eq } from "../../../../lib/db.js";

export const shippingPublicRoutes: FastifyPluginAsync = async (fastify) => {
    // List Shipping Methods
    fastify.get("/methods", {
        schema: {
            tags: ["Fulfillment"]
        }
    }, async () => {
        const results = await db.query.shippingMethods.findMany({
            where: eq(schema.shippingMethods.enabled, true),
        });
        return { methods: results };
    });

    // Show Shipping Method
    fastify.get("/methods/:id", {
        schema: {
            tags: ["Fulfillment"]
        }
    }, async (request, reply) => {
        const { id } = request.params as any;
        const method = await db.query.shippingMethods.findFirst({
            where: eq(schema.shippingMethods.id, id),
            with: {
                zones: {
                    with: {
                        cities: true
                    }
                }
            }
        });
        if (!method) {
            return reply.status(404).send({ message: "Shipping method not found" });
        }
        return method;
    });

    // List Shipping Zones (Public view usually needed for checkout)
    fastify.get("/zones", {
        schema: {
            tags: ["Fulfillment"]
        }
    }, async () => {
        const results = await db.query.shippingZones.findMany({
            with: { cities: true }
        });
        return { zones: results };
    });
};

export default shippingPublicRoutes;

