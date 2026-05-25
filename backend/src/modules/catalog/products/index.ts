import { FastifyPluginAsync } from "fastify";
import productsPublicRoutes from "./endpoints/public.js";
import productsAdminRoutes from "./endpoints/admin.js";

export const productsRoutes: FastifyPluginAsync = async (fastify) => {
    // Register protected admin routes FIRST to avoid slug conflicts
    // /_admin must be registered before /:idOrSlug so it matches first
    await fastify.register(productsAdminRoutes, { prefix: "/_admin" });

    // Register public storefront routes
    await fastify.register(productsPublicRoutes, { prefix: "/" });
};

export default productsRoutes;
