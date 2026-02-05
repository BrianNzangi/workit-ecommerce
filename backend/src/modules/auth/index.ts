import { FastifyPluginAsync } from "fastify";
import { auth } from "../../lib/auth.js";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";

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

    // Compatibility: GET /auth/session
    fastify.get("/session", {
        schema: {
            tags: ["Auth"]
        }
    }, async (request, reply) => {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(request.headers),
        });

        if (!session) {
            return reply.status(401).send({ message: "No session" });
        }

        return {
            user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: (session.user as any).role || "CUSTOMER",
            },
        };
    });

    // Compatibility: POST /auth/login
    fastify.post("/login", {
        schema: {
            tags: ["Auth"]
        }
    }, async (request, reply) => {
        const { email, password } = request.body as any;

        try {
            const result = await auth.api.signInEmail({
                body: {
                    email,
                    password,
                },
            });

            if (!result) {
                return reply.status(401).send({ message: "Invalid credentials" });
            }

            return {
                token: result.token,
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                    role: (result.user as any).role || "CUSTOMER",
                },
            };
        } catch (error: any) {
            return reply.status(401).send({ message: error.message || "Login failed" });
        }
    });
};

export default authRoutes;
