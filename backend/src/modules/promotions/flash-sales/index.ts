import { FastifyPluginAsync } from "fastify";
import flashSalesAdminRoutes from "./endpoints/admin.js";

export const flashSalesRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(flashSalesAdminRoutes, { prefix: "/admin" });
};

export default flashSalesRoutes;
