import { FastifyPluginAsync } from "fastify";
import bannersPublicRoutes from "./endpoints/public.js";
import bannersAdminRoutes from "./endpoints/admin.js";

export const bannersRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(bannersPublicRoutes, { prefix: "/" });
    await fastify.register(bannersAdminRoutes, { prefix: "/admin" });
};

export default bannersRoutes;
