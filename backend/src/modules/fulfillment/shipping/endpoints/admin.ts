import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const shippingAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Shipping Methods
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('shipping.manage')]
    }, async () => {
        const methods = await db.query.shippingMethods.findMany({
            with: {
                zones: {
                    with: {
                        cities: true
                    }
                }
            }
        });
        return methods;
    });

    // List Shipping Zones (Flat for zones management)
    fastify.get("/zones", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('shipping.manage')]
    }, async () => {
        const zones = await db.query.shippingZones.findMany({
            with: {
                cities: true
            }
        });
        return zones;
    });

    // Create Shipping Zone
    fastify.post("/zones", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('shipping.manage')]
    }, async (request) => {
        const { shippingMethodId, county, cities } = request.body as any;
        const zoneId = uuidv4();

        await db.insert(schema.shippingZones).values({
            id: zoneId,
            shippingMethodId,
            county
        });

        if (Array.isArray(cities) && cities.length > 0) {
            await db.insert(schema.shippingCities).values(
                cities.map(city => ({
                    id: uuidv4(),
                    zoneId,
                    cityTown: city.cityTown,
                    standardPrice: city.standardPrice,
                    expressPrice: city.expressPrice || 0
                }))
            );
        }

        await fastify.cache.invalidateTags(["shipping"]);
        return { id: zoneId, success: true };
    });

    // Update Shipping Zone (PATCH)
    fastify.patch("/zones/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('shipping.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const { county, cities } = request.body as any;

        // Update zone name/county
        await db.update(schema.shippingZones)
            .set({ county, updatedAt: new Date() })
            .where(eq(schema.shippingZones.id, id));

        if (Array.isArray(cities)) {
            // Simplest approach: Delete and recreate cities for this zone
            await db.delete(schema.shippingCities).where(eq(schema.shippingCities.zoneId, id));

            if (cities.length > 0) {
                await db.insert(schema.shippingCities).values(
                    cities.map(city => ({
                        id: uuidv4(),
                        zoneId: id,
                        cityTown: city.cityTown,
                        standardPrice: city.standardPrice,
                        expressPrice: city.expressPrice || 0
                    }))
                );
            }
        }

        await fastify.cache.invalidateTags(["shipping"]);
        return { success: true };
    });

    // Delete Shipping Zone
    fastify.delete("/zones/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('shipping.manage')]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.shippingZones).where(eq(schema.shippingZones.id, id));
        await fastify.cache.invalidateTags(["shipping"]);
        return { success: true };
    });

    // New Shipping Method
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('shipping.manage')]
    }, async (request) => {
        const data = request.body as any;
        const id = uuidv4();
        const [method] = await db.insert(schema.shippingMethods).values({ ...data, id }).returning();
        await fastify.cache.invalidateTags(["shipping"]);
        return method;
    });

    // Edit Shipping Method
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('shipping.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const data = request.body as any;
        const [method] = await db.update(schema.shippingMethods).set({ ...data, updatedAt: new Date() }).where(eq(schema.shippingMethods.id, id)).returning();
        if (!method) return reply.status(404).send({ message: "Shipping method not found" });
        await fastify.cache.invalidateTags(["shipping"]);
        return method;
    });

    // Delete Shipping Method
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('shipping.manage')]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.shippingMethods).where(eq(schema.shippingMethods.id, id));
        await fastify.cache.invalidateTags(["shipping"]);
        return { success: true };
    });
};

export default shippingAdminRoutes;


