import { FastifyPluginAsync } from "fastify";

export const brevoPublicRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/webhook", async (request) => {
        // Handle Brevo webhooks
        return { success: true };
    });
};

export default brevoPublicRoutes;
