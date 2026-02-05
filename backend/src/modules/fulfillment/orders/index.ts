import { FastifyPluginAsync } from "fastify";
import ordersPublicRoutes from "./endpoints/public.js";
import ordersAdminRoutes from "./endpoints/admin.js";

export const ordersRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(ordersPublicRoutes, { prefix: "/" });
    await fastify.register(ordersAdminRoutes, { prefix: "/admin" });
};

export default ordersRoutes;
