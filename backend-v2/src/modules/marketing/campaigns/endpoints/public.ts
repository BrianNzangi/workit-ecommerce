import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc } from "../../../../lib/db.js";

export const campaignsPublicRoutes: FastifyPluginAsync = async (fastify) => {
    // List Campaigns (Active/Public)
    // List Campaigns (Active/Public)
    fastify.get("/", {
        schema: {
            tags: ["Marketing"]
        }
    }, async () => {
        const results = await db.query.campaigns.findMany({
            where: eq(schema.campaigns.status, 'ACTIVE'),
            orderBy: [desc(schema.campaigns.createdAt)],
        });
        return { campaigns: results };
    });

    // Show Campaign
    // Show Campaign
    fastify.get("/:id", {
        schema: {
            tags: ["Marketing"]
        }
    }, async (request, reply) => {
        const { id } = request.params as any;
        const campaign = await db.query.campaigns.findFirst({
            where: eq(schema.campaigns.id, id),
        });
        if (!campaign) return reply.status(404).send({ message: "Campaign not found" });
        return campaign;
    });
};

export default campaignsPublicRoutes;

