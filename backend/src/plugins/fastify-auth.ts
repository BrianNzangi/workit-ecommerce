import fp from "fastify-plugin";
import authPlugin from "@fastify/auth";

export default fp(async (fastify) => {
    await fastify.register(authPlugin);
});
