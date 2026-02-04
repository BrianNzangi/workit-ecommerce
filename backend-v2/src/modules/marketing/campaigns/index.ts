import { FastifyPluginAsync } from "fastify";
import campaignsPublicRoutes from "./endpoints/public.js";
import campaignsAdminRoutes from "./endpoints/admin.js";

export const campaignsRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(campaignsPublicRoutes, { prefix: "/" });
    await fastify.register(campaignsAdminRoutes, { prefix: "/admin" });
};

export default campaignsRoutes;
