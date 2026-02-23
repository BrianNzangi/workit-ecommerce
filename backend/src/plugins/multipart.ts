import fp from "fastify-plugin";

export default fp(async (fastify) => {
    await fastify.register(import("@fastify/multipart"), {
        limits: {
            fileSize: 10 * 1024 * 1024,
            files: 1,
        },
    });
});
