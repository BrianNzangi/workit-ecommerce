import { FastifyPluginAsync } from "fastify";
import customersPublicRoutes from "./endpoints/public.js";
import customersAdminRoutes from "./endpoints/admin.js";

export const customersRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(customersPublicRoutes, { prefix: "/" });
    await fastify.register(customersAdminRoutes, { prefix: "/admin" });
};

export default customersRoutes;
