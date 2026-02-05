import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc } from "../../../../lib/db.js";

export const blogsPublicRoutes: FastifyPluginAsync = async (fastify) => {
    // List Blogs
    // List Blogs
    fastify.get("/", {
        schema: {
            tags: ["Marketing"]
        }
    }, async (request) => {
        const { limit = 10, offset = 0 } = request.query as any;
        const results = await db.query.blogs.findMany({
            limit: Number(limit),
            offset: Number(offset),
            orderBy: [desc(schema.blogs.createdAt)],
            with: { asset: true },
        });
        return { blogs: results };
    });

    // Show Blog (by Slug)
    // Show Blog (by Slug)
    fastify.get("/:slug", {
        schema: {
            tags: ["Marketing"]
        }
    }, async (request, reply) => {
        const { slug } = request.params as any;
        const blog = await db.query.blogs.findFirst({
            where: eq(schema.blogs.slug, slug),
            with: { asset: true },
        });
        if (!blog) return reply.status(404).send({ message: "Blog not found" });
        return blog;
    });

    // Search Blogs (Simple title search)
    // fastify.get("/search", ...) // Optional for public if needed
};

export default blogsPublicRoutes;

