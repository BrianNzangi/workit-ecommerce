import { FastifyPluginAsync } from "fastify";
import { checkoutPublicRoutes } from "./endpoints/public.js";

export const checkoutRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(checkoutPublicRoutes);
};
