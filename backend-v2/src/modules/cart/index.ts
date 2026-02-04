import { FastifyPluginAsync } from "fastify";
import { cartPublicRoutes } from "./endpoints/public.js";

export const cartRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(cartPublicRoutes);
};
