import { FastifyPluginAsync } from "fastify";
import settingsAdminRoutes from "./endpoints/admin.js";
import settingsPublicRoutes from "./endpoints/public.js";

export const settingsRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(settingsPublicRoutes, { prefix: "/" });
    await fastify.register(settingsAdminRoutes, { prefix: "/admin" });
};

export default settingsRoutes;
