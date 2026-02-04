import fp from "fastify-plugin";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

declare module "fastify" {
    interface FastifyRequest {
        auth: typeof auth;
        session: any | null;
        user: any | null;
    }
    interface FastifyInstance {
        authenticate: (request: any, reply: any) => Promise<void>;
        authorize: (roles: string[]) => (request: any, reply: any) => Promise<void>;
    }
}

export default fp(async (fastify) => {
    fastify.decorateRequest("auth", {
        getter: () => auth,
    });
    fastify.decorateRequest("session", undefined);
    fastify.decorateRequest("user", undefined);

    fastify.decorate("authenticate", async (request, reply) => {
        if (!request.session) {
            return reply.status(401).send({ message: "Unauthorized" });
        }
    });

    fastify.decorate("authorize", (roles: string[]) => {
        return async (request: any, reply: any) => {
            if (!request.session) {
                return reply.status(401).send({ message: "Unauthorized" });
            }
            if (!roles.includes(request.user.role)) {
                return reply.status(403).send({ message: "Forbidden" });
            }
        };
    });

    fastify.addHook("preHandler", async (request, reply) => {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(request.headers),
        });

        if (session) {
            request.session = session.session;
            request.user = session.user;
        }
    });
});
