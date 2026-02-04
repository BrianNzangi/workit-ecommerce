import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const campaignsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Campaigns
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async () => {
        const results = await db.query.campaigns.findMany({
            orderBy: [desc(schema.campaigns.createdAt)],
        });
        return { campaigns: results, success: true };
    });

    // New Campaign
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const data = request.body as any;
        const id = uuidv4();

        // Process data for Drizzle compatibility
        const values = {
            ...data,
            id,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : null,
            bannerIds: Array.isArray(data.bannerIds) ? JSON.stringify(data.bannerIds) : data.bannerIds,
            collectionIds: Array.isArray(data.collectionIds) ? JSON.stringify(data.collectionIds) : data.collectionIds,
            productIds: Array.isArray(data.productIds) ? JSON.stringify(data.productIds) : data.productIds,
        };

        const [campaign] = await db.insert(schema.campaigns).values(values).returning();
        return { campaign, success: true };
    });

    fastify.get("/search", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { q } = request.query as any;
        const results = await db.query.campaigns.findMany({
            where: ilike(schema.campaigns.name, `%${q}%`),
        });
        return { campaigns: results, success: true };
    });

    // Show Campaign
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const campaign = await db.query.campaigns.findFirst({
            where: eq(schema.campaigns.id, id),
        });
        if (!campaign) return reply.status(404).send({ message: "Campaign not found" });
        return { campaign, success: true };
    });

    // Edit Campaign Handler
    const updateCampaignHandler = async (request: any, reply: any) => {
        const { id } = request.params as any;
        const data = request.body as any;

        // Process data for Drizzle compatibility
        const values = {
            ...data,
            updatedAt: new Date(),
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : null,
            bannerIds: Array.isArray(data.bannerIds) ? JSON.stringify(data.bannerIds) : data.bannerIds,
            collectionIds: Array.isArray(data.collectionIds) ? JSON.stringify(data.collectionIds) : data.collectionIds,
            productIds: Array.isArray(data.productIds) ? JSON.stringify(data.productIds) : data.productIds,
        };

        const [campaign] = await db.update(schema.campaigns).set(values).where(eq(schema.campaigns.id, id)).returning();
        if (!campaign) return reply.status(404).send({ message: "Campaign not found" });
        return { campaign, success: true };
    };

    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, updateCampaignHandler);

    fastify.patch("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, updateCampaignHandler);

    // Delete Campaign
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.campaigns).where(eq(schema.campaigns.id, id));
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
        await db.delete(schema.campaigns).where(inArray(schema.campaigns.id, ids));
        return { success: true, count: ids.length };
    });
};

export default campaignsAdminRoutes;

