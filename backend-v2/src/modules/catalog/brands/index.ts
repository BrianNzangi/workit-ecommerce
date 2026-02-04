import { FastifyPluginAsync } from "fastify";
import brandsPublicRoutes from "./endpoints/public.js";
import brandsAdminRoutes from "./endpoints/admin.js";

export const brandsRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(brandsPublicRoutes, { prefix: "/" });
    await fastify.register(brandsAdminRoutes, { prefix: "/admin" });
};

export default brandsRoutes;
