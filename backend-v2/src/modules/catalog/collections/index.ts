import { FastifyPluginAsync } from "fastify";
import collectionsPublicRoutes from "./endpoints/public.js";
import collectionsAdminRoutes from "./endpoints/admin.js";

export const collectionsRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(collectionsPublicRoutes, { prefix: "/" });
    await fastify.register(collectionsAdminRoutes, { prefix: "/admin" });
};

export default collectionsRoutes;
