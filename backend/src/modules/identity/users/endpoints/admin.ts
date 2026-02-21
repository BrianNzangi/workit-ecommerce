import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";
import { adminRoles, normalizeUserRole } from "../../../../lib/rbac.js";
// import bcrypt from "bcrypt"; // Uncomment if creating users/passwords directly

export const usersAdminRoutes: FastifyPluginAsync = async (fastify) => {
    const resolveRole = (role: unknown, fallback: "ADMIN" | "CUSTOMER" | null = "ADMIN") => {
        if (role === undefined || role === null || role === "") return fallback;
        const normalized = normalizeUserRole(role);
        return normalized;
    };

    // List Users
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('users.manage')]
    }, async () => {
        const results = await db.query.users.findMany({
            where: inArray(schema.users.role, [...adminRoles]),
            orderBy: [desc(schema.users.createdAt)],
        });
        return results; // Return flat array as expected by front
    });

    // New User (Internal)
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('users.manage')]
    }, async (request) => {
        const data = request.body as any;
        const id = uuidv4();
        const role = resolveRole(data.role, "ADMIN");
        if (!role) {
            return fastify.httpErrors.badRequest("Invalid role. Allowed values: SUPER_ADMIN, ADMIN, EDITOR, CUSTOMER.");
        }

        // Hash password if provided
        let password = data.password;
        if (password) {
            const bcrypt = await import("bcryptjs");
            password = await (bcrypt.default || bcrypt).hash(password, 10);
        }

        // Derive `name` from firstName + lastName (fall back to email)
        const firstName = data.firstName || '';
        const lastName = data.lastName || '';
        const name = `${firstName} ${lastName}`.trim() || data.email;

        fastify.log.info({ name, firstName, lastName }, "Creating user with name");

        // Explicitly set every field — NO spread to avoid Drizzle treating undefined as SQL DEFAULT
        const [user] = await db.insert(schema.users).values({
            id,
            name,
            email: data.email,
            emailVerified: true,
            role,
            firstName: firstName || null,
            lastName: lastName || null,
            password,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return user;
    });

    // Edit User
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('users.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const data = request.body as any;
        const role = resolveRole(data.role, null);
        if (data.role !== undefined && !role) {
            return reply.status(400).send({ message: "Invalid role. Allowed values: SUPER_ADMIN, ADMIN, EDITOR, CUSTOMER." });
        }

        // Don't allow updating password via this endpoint for now to keep it simple
        // If password is sent, hash it or ignore it. Let's ignore it to avoid accidental changes.
        const { password, role: _incomingRole, ...updateData } = data;
        if (role) {
            updateData.role = role;
        }

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
        preHandler: [fastify.authenticate, fastify.authorizePermission('users.manage')]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.users).where(eq(schema.users.id, id));
        return { success: true };
    });
};

export default usersAdminRoutes;


