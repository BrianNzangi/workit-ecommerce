import { FastifyPluginAsync } from "fastify";
import productsPublicRoutes from "./endpoints/public.js";
import productsAdminRoutes from "./endpoints/admin.js";

export const productsRoutes: FastifyPluginAsync = async (fastify) => {
    // Register public storefront routes
    await fastify.register(productsPublicRoutes, { prefix: "/" });

    // Register protected admin routes
    // Note: Admin routes usually have the same URL patterns but different methods/auth
    // Or they can be prefixed if needed, but per the request, we keep parity.
    await fastify.register(productsAdminRoutes, { prefix: "/admin" });
};

export default productsRoutes;
