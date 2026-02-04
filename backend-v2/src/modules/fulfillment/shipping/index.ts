import { FastifyPluginAsync } from "fastify";
import shippingPublicRoutes from "./endpoints/public.js";
import shippingAdminRoutes from "./endpoints/admin.js";

export const shippingRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(shippingPublicRoutes, { prefix: "/" });
    await fastify.register(shippingAdminRoutes, { prefix: "/admin" });
};

export default shippingRoutes;
