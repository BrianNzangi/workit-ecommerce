import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

const mapBanner = (banner: any) => {
    if (!banner) return null;
    return {
        ...banner,
        name: banner.title,
    };
};

export const bannersAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Banners
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async () => {
        const results = await db.query.banners.findMany({
            orderBy: [desc(schema.banners.sortOrder)],
            with: {
                collection: true,
                desktopImage: true,
                mobileImage: true,
            },
        });
        return { banners: results.map(mapBanner), success: true };
    });

    // New Banner
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const data = request.body as any;
        const id = uuidv4();

        // Map frontend 'name' to backend 'title' and handle empty FK strings
        const values = {
            ...data,
            id,
            title: data.name || data.title,
            desktopImageId: data.desktopImageId || null,
            mobileImageId: data.mobileImageId || null,
            collectionId: data.collectionId || null,
            updatedAt: new Date(),
        };
        // Remove 'name' if it exists to avoid conflicts if any
        delete values.name;

        const [banner] = await db.insert(schema.banners).values(values).returning();
        return { banner: mapBanner(banner), success: true };
    });

    // Search Banners
    fastify.get("/search", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { q } = request.query as any;
        const results = await db.query.banners.findMany({
            where: ilike(schema.banners.title, `%${q}%`), // Assuming title exists or mapped
            with: {
                collection: true,
                desktopImage: true,
                mobileImage: true,
            },
        });
        return { banners: results.map(mapBanner), success: true };
    });

    // Show Banner
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const banner = await db.query.banners.findFirst({
            where: eq(schema.banners.id, id),
            with: {
                collection: true,
                desktopImage: true,
                mobileImage: true,
            },
        });
        if (!banner) return reply.status(404).send({ message: "Banner not found" });
        return { banner: mapBanner(banner), success: true };
    });

    // Update Banner Handler
    const updateBannerHandler = async (request: any, reply: any) => {
        const { id } = request.params as any;
        const data = request.body as any;

        // Map frontend 'name' to backend 'title' and handle empty FK strings
        const values = {
            ...data,
            title: data.name || data.title,
            desktopImageId: data.desktopImageId || null,
            mobileImageId: data.mobileImageId || null,
            collectionId: data.collectionId || null,
            updatedAt: new Date(),
        };
        delete values.name;

        const [banner] = await db.update(schema.banners).set(values).where(eq(schema.banners.id, id)).returning();
        if (!banner) return reply.status(404).send({ message: "Banner not found" });
        return { banner: mapBanner(banner), success: true };
    };

    // Edit Banner
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, updateBannerHandler);

    // Edit Banner (PATCH Alias)
    fastify.patch("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, updateBannerHandler);

    // Delete Banner
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.banners).where(eq(schema.banners.id, id));
        return { success: true };
    });

    // Bulk Delete
    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { ids } = request.body as any;
        if (!Array.isArray(ids) || ids.length === 0) {
            return { success: false, message: "No IDs provided" };
        }
        await db.delete(schema.banners).where(inArray(schema.banners.id, ids));
        return { success: true, count: ids.length };
    });
};

export default bannersAdminRoutes;

