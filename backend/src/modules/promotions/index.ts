import { FastifyPluginAsync } from "fastify";
import couponsRoutes from "./coupons/index.js";
import flashSalesRoutes from "./flash-sales/index.js";
import featuredDealsRoutes from "./featured-deals/index.js";
import clearanceDealsRoutes from "./clearance-deals/index.js";

export const promotionsRoutes: FastifyPluginAsync = async (fastify) => {
    await fastify.register(couponsRoutes, { prefix: "/coupons" });
    await fastify.register(flashSalesRoutes, { prefix: "/flash-sales" });
    await fastify.register(featuredDealsRoutes, { prefix: "/featured-deals" });
    await fastify.register(clearanceDealsRoutes, { prefix: "/clearance-deals" });
};

export default promotionsRoutes;
