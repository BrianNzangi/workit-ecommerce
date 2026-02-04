import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc } from "../../../../lib/db.js";

export const brandsPublicRoutes: FastifyPluginAsync = async (fastify) => {
    // List Brands
    // List Brands
    fastify.get("/", {
        schema: {
            tags: ["Catalog"]
        }
    }, async () => {
        const results = await db.query.brands.findMany({
            orderBy: [desc(schema.brands.name)],
        });
        return { brands: results };
    });

    // Show Brand
    // Show Brand
    fastify.get("/:id", {
        schema: {
            tags: ["Catalog"]
        }
    }, async (request, reply) => {
        const { id } = request.params as any;
        const brand = await db.query.brands.findFirst({
            where: eq(schema.brands.id, id),
        });
        if (!brand) return reply.status(404).send({ message: "Brand not found" });
        return brand;
    });
};

export default brandsPublicRoutes;
