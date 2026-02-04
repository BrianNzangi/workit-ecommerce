import { FastifyPluginAsync } from "fastify";
import { db, schema, eq } from "../../../../lib/db.js";

export const usersPublicRoutes: FastifyPluginAsync = async (fastify) => {
    // Show Me (Authenticated User Profile)
    fastify.get("/me", {
        schema: {
            tags: ["Identity"]
        },
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        const user = request.user as any;
        if (!user || !user.id) return reply.status(401).send({ message: "Unauthorized" });

        const profile = await db.query.users.findFirst({
            where: eq(schema.users.id, user.id),
        });

        return profile;
    });
};

export default usersPublicRoutes;

