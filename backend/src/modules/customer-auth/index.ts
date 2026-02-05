import { FastifyPluginAsync } from "fastify";
import customerAuthPublicRoutes from "./endpoints/public.js";

export const customerAuthRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(customerAuthPublicRoutes, { prefix: "/" });
};

export default customerAuthRoutes;
