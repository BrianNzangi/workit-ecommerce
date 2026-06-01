import { FastifyPluginAsync } from "fastify";
import reviewsAdminRoutes from "./endpoints/admin.js";

export const reviewsRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(reviewsAdminRoutes, { prefix: "/admin" });
};

export default reviewsRoutes;
