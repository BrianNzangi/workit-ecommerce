import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, inArray, and } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";
import { createCustomerSchema } from "@workit/validation";

export const customersAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Customers
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { limit = 50, offset = 0 } = request.query as any;
        const results = await db.query.users.findMany({
            where: eq(schema.users.role, 'CUSTOMER'),
            limit: Number(limit),
            offset: Number(offset),
            orderBy: [desc(schema.users.createdAt)],
        });
        return { customers: results, success: true };
    });

    // Create Customer
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const body = request.body as any;

        // Use the new validation schema
        const validation = createCustomerSchema.safeParse(body);
        if (!validation.success) {
            return reply.status(400).send({
                message: "Validation failed",
                errors: validation.error.format()
            });
        }

        const data = validation.data;
        const { email, password } = data;

        // Check availability
        const existingUser = await db.query.users.findFirst({
            where: eq(schema.users.email, email),
        });
        if (existingUser) {
            return reply.status(409).send({ message: "Email already exists" });
        }

        const hashedPassword = await import("bcryptjs").then(bcrypt => bcrypt.default.hash((password as string), 10));
        const id = uuidv4();

        const [customer] = await db.insert(schema.users).values({
            ...data,
            id,
            name: `${data.firstName} ${data.lastName}`,
            password: hashedPassword,
            emailVerified: true, // Auto verify admin created users
            role: 'CUSTOMER',
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return customer;
    });

    // Search Customers
    fastify.get("/search", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { q } = request.query as any;
        const results = await db.query.users.findMany({
            where: and(
                eq(schema.users.role, 'CUSTOMER'),
                ilike(schema.users.name, `%${q}%`)
            )
        });
        return { customers: results, success: true };
    });

    // Show Customer
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const customer = await db.query.users.findFirst({
            where: and(eq(schema.users.id, id), eq(schema.users.role, 'CUSTOMER')),
        });
        if (!customer) return reply.status(404).send({ message: "Customer not found" });
        return { customer, success: true };
    });

    // Edit Customer
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const data = request.body as any;
        const [customer] = await db.update(schema.users).set({ ...data, updatedAt: new Date() }).where(eq(schema.users.id, id)).returning();
        if (!customer) return reply.status(404).send({ message: "Customer not found" });
        return { customer, success: true };
    });

    // Delete Customer
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.users).where(eq(schema.users.id, id));
        return { success: true };
    });

    // Bulk Delete
    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { ids } = request.body as any;
        if (!Array.isArray(ids) || ids.length === 0) return { success: false };
        await db.delete(schema.users).where(inArray(schema.users.id, ids));
        return { success: true, count: ids.length };
    });
};

export default customersAdminRoutes;
