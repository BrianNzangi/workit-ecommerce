import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, or, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const brandsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Brands
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async () => {
        const results = await (db as any).query.brands.findMany({
            orderBy: [desc(schema.brands.name as any)],
        });
        return { brands: results, success: true };
    });

    // New Brand
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (request) => {
        const brandData = request.body as any;
        const id = uuidv4();
        const [brand] = await db.insert(schema.brands).values({ ...brandData, id }).returning();
        await fastify.cache.invalidateTags(["brands", "products"]);
        return { brand, success: true };
    });

    // Search Brands
    fastify.get("/search", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (request) => {
        const { q } = request.query as any;
        const results = await (db as any).query.brands.findMany({
            where: ilike(schema.brands.name as any, `%${q}%`),
        });
        return { brands: results, success: true };
    });

    // Show Brand
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const brand = await db.query.brands.findFirst({
            where: eq(schema.brands.id, id),
        });
        if (!brand) return reply.status(404).send({ message: "Brand not found" });
        return { brand, success: true };
    });

    // Update Brand Handler
    const updateBrandHandler = async (request: any, reply: any) => {
        const { id } = request.params as any;
        const brandData = request.body as any;
        const [brand] = await db.update(schema.brands).set({ ...brandData, updatedAt: new Date() }).where(eq(schema.brands.id, id)).returning();
        if (!brand) return reply.status(404).send({ message: "Brand not found" });
        await fastify.cache.invalidateTags(["brands", "products"]);
        return { brand, success: true };
    };

    // Edit Brand
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, updateBrandHandler);

    // Edit Brand (PATCH Alias)
    fastify.patch("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, updateBrandHandler);

    // Delete Brand
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.brands).where(eq(schema.brands.id, id));
        await fastify.cache.invalidateTags(["brands", "products"]);
        return { success: true };
    });

    // Bulk Delete
    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (request) => {
        const { ids } = request.body as any;
        if (!Array.isArray(ids) || ids.length === 0) {
            return { success: false, message: "No IDs provided" };
        }
        await db.delete(schema.brands).where(inArray(schema.brands.id, ids));
        await fastify.cache.invalidateTags(["brands", "products"]);
        return { success: true, count: ids.length };
    });
};

export default brandsAdminRoutes;

