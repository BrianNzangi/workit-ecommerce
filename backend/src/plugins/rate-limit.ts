import fp from "fastify-plugin";
import { rateLimit } from "../lib/rate-limit.js";

declare module "fastify" {
    interface FastifyInstance {
        publicRateLimit: (request: any, reply: any) => Promise<void>;
    }
}

export default fp(async (fastify) => {
    const limitEnv = Number(process.env.PUBLIC_RATE_LIMIT);
    const windowEnv = Number(process.env.PUBLIC_RATE_WINDOW_SECONDS);
    const limit = Number.isFinite(limitEnv) && limitEnv > 0 ? limitEnv : 120;
    const durationSeconds = Number.isFinite(windowEnv) && windowEnv > 0 ? windowEnv : 60;

    fastify.decorate("publicRateLimit", async (request, reply) => {
        const headerIp = request.headers["x-forwarded-for"] || request.headers["x-real-ip"];
        const ip = (Array.isArray(headerIp) ? headerIp[0] : headerIp)?.split(",")[0]?.trim() || request.ip || "unknown";
        const key = `ratelimit:${ip}`;

        const limiter = await rateLimit(fastify.redis ?? null, key, limit, durationSeconds);

        if (!limiter.success) {
            return reply.status(429).send({
                error: "Too Many Requests",
                retryAfter: limiter.retryAfter,
            });
        }
    });
}, { name: "rate-limit", dependencies: ["redis"] });
