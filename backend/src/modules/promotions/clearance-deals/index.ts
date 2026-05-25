import { FastifyPluginAsync } from "fastify";
import clearanceDealsAdminRoutes from "./endpoints/admin.js";

export const clearanceDealsRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(clearanceDealsAdminRoutes, { prefix: "/admin" });
};

export default clearanceDealsRoutes;
