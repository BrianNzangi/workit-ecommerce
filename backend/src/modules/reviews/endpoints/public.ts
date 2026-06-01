import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, and, inArray, desc } from "../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

const COMPLETED_ORDER_STATES = ['PAYMENT_SETTLED', 'SHIPPED', 'DELIVERED'] as const;

export const reviewsPublicRoutes: FastifyPluginAsync = async (fastify) => {

    // ─── POST /products/:id/reviews ── Submit a review (verified purchase required) ───
    fastify.post("/products/:id/reviews", {
        preHandler: [fastify.authenticate],
    }, async (request, reply) => {
        const { id: productId } = request.params as any;
        const { rating, title, comment } = request.body as any;
        const customerId = (request as any).user?.id;

        if (!customerId) {
            return reply.status(401).send({ message: "Authentication required" });
        }

        // Validate input
        if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return reply.status(400).send({ message: "Rating must be between 1 and 5" });
        }
        if (!comment || typeof comment !== 'string' || !comment.trim()) {
            return reply.status(400).send({ message: "Comment is required" });
        }

        // Check for verified purchase
        const orders = await db.query.orders.findMany({
            where: and(
                eq(schema.orders.customerId, customerId),
                inArray(schema.orders.state, COMPLETED_ORDER_STATES as any),
            ),
            with: {
                lines: {
                    where: eq(schema.orderLines.productId, productId),
                },
            },
        }) as Array<{ id: string; lines: Array<{ productId: string }> }>;

        const verifiedOrder = orders.find((o) => o.lines.length > 0);
        if (!verifiedOrder) {
            return reply.status(403).send({ message: "You must purchase this product before reviewing it" });
        }

        // Check for existing review from this customer for this product
        const existingReview = await db.query.reviews.findFirst({
            where: and(
                eq(schema.reviews.productId, productId),
                eq(schema.reviews.customerId, customerId),
            ),
        });
        if (existingReview) {
            return reply.status(409).send({ message: "You have already reviewed this product" });
        }

        const id = uuidv4();
        const [review] = await db.insert(schema.reviews).values({
            id,
            productId,
            customerId,
            orderId: verifiedOrder.id,
            rating,
            title: title || null,
            comment: comment.trim(),
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return reply.status(201).send({ review, success: true });
    });

    // ─── GET /products/:id/reviews ── List approved reviews for a product ───
    fastify.get("/products/:id/reviews", {
        preHandler: [fastify.publicRateLimit],
    }, async (request, reply) => {
        const { id: productId } = request.params as any;

        const reviews = await db.query.reviews.findMany({
            where: and(
                eq(schema.reviews.productId, productId),
                eq(schema.reviews.status, 'APPROVED'),
            ),
            with: {
                customer: {
                    columns: { firstName: true, lastName: true },
                },
            },
            orderBy: [desc(schema.reviews.createdAt)],
        });

        // Compute average rating
        const totalRating = (reviews as any[]).reduce((sum: number, r: any) => sum + r.rating, 0);
        const avgRating = reviews.length > 0
            ? Math.round((totalRating / reviews.length) * 10) / 10
            : 0;

        return {
            reviews: (reviews as any[]).map((r: any) => ({
                id: r.id,
                rating: r.rating,
                title: r.title,
                comment: r.comment,
                customerName: r.customer ? `${r.customer.firstName || ''} ${r.customer.lastName || ''}`.trim() || 'Anonymous' : 'Anonymous',
                createdAt: r.createdAt,
            })),
            averageRating: avgRating,
            totalReviews: reviews.length,
        };
    });
};

export default reviewsPublicRoutes;
