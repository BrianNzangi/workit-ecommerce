import { FastifyPluginAsync } from "fastify";
import featuredDealsAdminRoutes from "./endpoints/admin.js";

export const featuredDealsRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(featuredDealsAdminRoutes, { prefix: "/admin" });
};

export default featuredDealsRoutes;
