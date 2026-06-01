import { FastifyPluginAsync } from "fastify";
import storePublicRoutes from "./endpoints/public.js";
import reviewsPublicRoutes from "../../reviews/endpoints/public.js";

export const storeRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(storePublicRoutes, { prefix: "/" });
    await fastify.register(reviewsPublicRoutes, { prefix: "/" });
};

export default storeRoutes;
