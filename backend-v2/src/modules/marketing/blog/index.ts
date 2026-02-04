import { FastifyPluginAsync } from "fastify";
import blogsPublicRoutes from "./endpoints/public.js";
import blogsAdminRoutes from "./endpoints/admin.js";

export const blogsRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(blogsPublicRoutes, { prefix: "/" });
    await fastify.register(blogsAdminRoutes, { prefix: "/admin" });
};

export default blogsRoutes;
