import { FastifyPluginAsync } from "fastify";
import analyticsAdminRoutes from "./endpoints/admin.js";

export const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(analyticsAdminRoutes, { prefix: "/" });
};

export default analyticsRoutes;
