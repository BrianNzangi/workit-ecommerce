import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, inArray, and, desc, asc } from "../../../lib/db.js";

export const reviewsAdminRoutes: FastifyPluginAsync = async (fastify) => {

    // ─── GET / ── List all reviews (with optional status filter) ───
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')],
    }, async (request) => {
        const { status } = request.query as any;

        const where = status
            ? eq(schema.reviews.status, status)
            : undefined;

        const reviews = await db.query.reviews.findMany({
            where,
            with: {
                product: { columns: { id: true, name: true, slug: true } },
                customer: { columns: { id: true, firstName: true, lastName: true, email: true } },
            },
            orderBy: [desc(schema.reviews.createdAt)],
        });

        return { reviews, success: true };
    });

    // ─── PATCH /:id/status ── Approve or reject a review ───
    fastify.patch("/:id/status", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')],
    }, async (request, reply) => {
        const { id } = request.params as any;
        const { status } = request.body as any;

        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
            return reply.status(400).send({ message: "Status must be APPROVED or REJECTED" });
        }

        const [review] = await db.update(schema.reviews)
            .set({ status, updatedAt: new Date() })
            .where(eq(schema.reviews.id, id))
            .returning();

        if (!review) {
            return reply.status(404).send({ message: "Review not found" });
        }

        return { review, success: true };
    });

    // ─── DELETE /:id ── Delete a review ───
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')],
    }, async (request, reply) => {
        const { id } = request.params as any;

        const [review] = await db.delete(schema.reviews)
            .where(eq(schema.reviews.id, id))
            .returning();

        if (!review) {
            return reply.status(404).send({ message: "Review not found" });
        }

        return { success: true };
    });
};

export default reviewsAdminRoutes;
