import { FastifyPluginAsync } from "fastify";
import storePublicRoutes from "./endpoints/public.js";

export const storeRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(storePublicRoutes, { prefix: "/" });
};

export default storeRoutes;
