import { FastifyPluginAsync } from "fastify";
import assetsPublicRoutes from "./endpoints/public.js";
import assetsAdminRoutes from "./endpoints/admin.js";

export const assetsRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(assetsPublicRoutes, { prefix: "/" });
    await fastify.register(assetsAdminRoutes, { prefix: "/admin" }); // Assuming admin prefix for write ops
};

export default assetsRoutes;
