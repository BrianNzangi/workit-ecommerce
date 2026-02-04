import { FastifyPluginAsync } from "fastify";
import { auth } from "../../../lib/auth.js";
import { db, schema, eq } from "../../../lib/db.js";

export const customerAuthPublicRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/login", {
        schema: {
            tags: ["Customer Auth"]
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

    fastify.get("/session", {
        schema: {
            tags: ["Customer Auth"]
        }
    }, async (request, reply) => {
        const session = (request as any).session;
        if (!session) {
            return reply.status(401).send({ message: "Not logged in" });
        }
        return {
            user: {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: (session.user as any).role || "CUSTOMER",
            }
        };
    });

    fastify.post("/register", {
        schema: {
            tags: ["Customer Auth"]
        }
    }, async (request, reply) => {
        const { email, password, name, firstName, lastName } = request.body as any;
        try {
            const user = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name: name || `${firstName} ${lastName}`,
                    firstName,
                    lastName,
                }
            });
            return user;
        } catch (error: any) {
            return reply.status(400).send({ message: error.message || "Registration failed" });
        }
    });
};

export default customerAuthPublicRoutes;
