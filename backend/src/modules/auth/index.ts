import { FastifyPluginAsync } from "fastify";
import { auth } from "../../lib/auth.js";
import { toNodeHandler } from "better-auth/node";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
    // Better Auth standard routes (e.g., /auth/sign-in/email)
    await fastify.register(async (subFastify) => {
        subFastify.removeAllContentTypeParsers();
        subFastify.addContentTypeParser('*', (req, payload, done) => {
            done(null, payload);
        });

        subFastify.all("/*", {
            schema: {
                tags: ["Auth"]
            }
        }, async (request, reply) => {
            return toNodeHandler(auth)(request.raw, reply.raw);
        });
    });

};

export default authRoutes;
