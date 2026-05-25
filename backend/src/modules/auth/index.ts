import { FastifyPluginAsync } from "fastify";
import { auth } from "../../lib/auth.js";
import { toNodeHandler } from "better-auth/node";
import { withDevOrigins } from "../../lib/dev-origins.js";

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/$/, "");

const splitOrigins = (value?: string): string[] =>
    (value ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

const allowedOrigins = withDevOrigins(Array.from(
    new Set([
        ...splitOrigins(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
        ...splitOrigins(process.env.CORS_ORIGIN),
        ...splitOrigins(process.env.FRONTEND_URL),
        ...splitOrigins(process.env.ADMIN_URL),
    ].map(normalizeOrigin)),
));

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
            const origin = typeof request.headers.origin === "string"
                ? normalizeOrigin(request.headers.origin)
                : "";
            const isAllowedOrigin = origin && allowedOrigins.includes(origin);

            if (isAllowedOrigin) {
                reply.raw.setHeader("Access-Control-Allow-Origin", origin);
                reply.raw.setHeader("Vary", "Origin");
                reply.raw.setHeader("Access-Control-Allow-Credentials", "true");
                reply.raw.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
                reply.raw.setHeader(
                    "Access-Control-Allow-Headers",
                    typeof request.headers["access-control-request-headers"] === "string"
                        ? request.headers["access-control-request-headers"]
                        : "Content-Type, Authorization",
                );
            }

            if (request.method === "OPTIONS") {
                return reply.code(204).send();
            }

            const originalUrl = request.raw.url || "";

            // Better Auth expects routes under /auth/*.
            // Depending on Fastify prefix mounting, request.raw.url can arrive as:
            // - /api/auth/sign-in/email
            // - /auth/sign-in/email
            // - /sign-in/email
            if (originalUrl.startsWith("/api/auth")) {
                request.raw.url = originalUrl.replace(/^\/api\/auth/, "/auth");
            } else if (!originalUrl.startsWith("/auth")) {
                request.raw.url = `/auth${originalUrl.startsWith("/") ? originalUrl : `/${originalUrl}`}`;
            }

            try {
                return toNodeHandler(auth)(request.raw, reply.raw);
            } finally {
                if (originalUrl) {
                    request.raw.url = originalUrl;
                }
            }
        });
    });

};

export default authRoutes;
