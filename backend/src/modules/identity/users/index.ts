import { FastifyPluginAsync } from "fastify";
import usersPublicRoutes from "./endpoints/public.js";
import usersAdminRoutes from "./endpoints/admin.js";

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(usersPublicRoutes, { prefix: "/" });
    await fastify.register(usersAdminRoutes, { prefix: "/admin" });
};

export default usersRoutes;
