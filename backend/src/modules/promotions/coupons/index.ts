import { FastifyPluginAsync } from "fastify";
import couponsAdminRoutes from "./endpoints/admin.js";

export const couponsRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(couponsAdminRoutes, { prefix: "/admin" });
};

export default couponsRoutes;
