import { FastifyPluginAsync } from "fastify";
import brevoPublicRoutes from "./endpoints/public.js";

export const brevoRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(brevoPublicRoutes, { prefix: "/" });
};

export default brevoRoutes;
