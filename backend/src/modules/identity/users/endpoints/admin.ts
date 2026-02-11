import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";
// import bcrypt from "bcrypt"; // Uncomment if creating users/passwords directly

export const usersAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Users
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async () => {
        const results = await db.query.users.findMany({
            orderBy: [desc(schema.users.createdAt)],
        });
        return results; // Return flat array as expected by frontend
    });

    // New User (Internal)
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const data = request.body as any;
        const id = uuidv4();

        // Hash password if provided
        let password = data.password;
        if (password) {
            const bcrypt = await import("bcryptjs");
            password = await (bcrypt.default || bcrypt).hash(password, 10);
        }

        // Derive `name` from firstName + lastName (always required)
        const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email;

        // Destructure out fields we set explicitly to prevent `undefined` values
        // from the request body overriding them (Drizzle treats undefined as SQL DEFAULT)
        const { name: _n, id: _id, password: _p, image: _img, enabled: _en, phoneNumber: _ph, ...safeData } = data;

        fastify.log.info({ name, firstName: data.firstName, lastName: data.lastName }, "CRITICAL DEBUG - Inserting user with name");

        const [user] = await db.insert(schema.users).values({
            ...safeData,
            id,
            name,
            password,
            emailVerified: true, // Internal users are verified by default
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();

        return user;
    });

    // Edit User
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const data = request.body as any;

        // Don't allow updating password via this endpoint for now to keep it simple
        // If password is sent, hash it or ignore it. Let's ignore it to avoid accidental changes.
        const { password, ...updateData } = data;

        // Keep `name` in sync when firstName/lastName change
        if (updateData.firstName || updateData.lastName) {
            updateData.name = `${updateData.firstName || ''} ${updateData.lastName || ''}`.trim();
        }

        const [user] = await db.update(schema.users)
            .set({ ...updateData, updatedAt: new Date() })
            .where(eq(schema.users.id, id))
            .returning();

        if (!user) return reply.status(404).send({ message: "User not found" });
        return user;
    });

    // Delete User
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.users).where(eq(schema.users.id, id));
        return { success: true };
    });
};

export default usersAdminRoutes;

