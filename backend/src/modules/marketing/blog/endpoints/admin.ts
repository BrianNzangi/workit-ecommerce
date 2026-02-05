import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, ilike, inArray } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

export const blogsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Blogs
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { limit = 100, offset = 0 } = request.query as any;
        const results = await db.query.blogs.findMany({
            limit: Number(limit),
            offset: Number(offset),
            orderBy: [desc(schema.blogs.createdAt)],
            with: { asset: true },
        });
        return { blogs: results };
    });

    // New Blog
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        try {
            const data = request.body as any;
            const id = uuidv4();

            // Log the incoming data for debugging
            try {
                console.log('[Blog Create] Incoming data:', JSON.stringify(data, null, 2));
            } catch (e) {
                console.log('[Blog Create] Incoming data (raw):', data);
                console.log('[Blog Create] JSON stringify error:', e);
            }

            // Whitelist of valid blog fields from schema
            const validFields = ['title', 'slug', 'content', 'excerpt', 'author', 'published', 'publishedAt', 'assetId'];

            // Filter to only include valid fields
            const sanitizedData: any = {};
            for (const key of validFields) {
                if (data[key] !== undefined) {
                    sanitizedData[key] = data[key];
                }
            }

            // Convert publishedAt from ISO string to Date object (Drizzle expects Date, not string)
            if (sanitizedData.publishedAt) {
                sanitizedData.publishedAt = new Date(sanitizedData.publishedAt);
            } else {
                sanitizedData.publishedAt = null;
            }

            console.log('[Blog Create] Sanitized data:', JSON.stringify(sanitizedData, null, 2));

            const [blog] = await db.insert(schema.blogs).values({ ...sanitizedData, id }).returning();
            return blog;
        } catch (error: any) {
            console.error('[Blog Create] Error:', error);
            console.error('[Blog Create] Error stack:', error.stack);
            return reply.status(500).send({
                message: error.message || 'Failed to create blog',
                error: error.toString()
            });
        }
    });

    // Search Blogs
    fastify.get("/search", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { q } = request.query as any;
        const results = await db.query.blogs.findMany({
            where: ilike(schema.blogs.title, `%${q}%`),
            with: { asset: true },
        });
        return { blogs: results };
    });

    // Show Blog
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const blog = await db.query.blogs.findFirst({
            where: eq(schema.blogs.id, id),
            with: { asset: true },
        });
        if (!blog) return reply.status(404).send({ message: "Blog not found" });
        return blog;
    });

    // Edit Blog
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const data = request.body as any;
        const [blog] = await db.update(schema.blogs).set({ ...data, updatedAt: new Date() }).where(eq(schema.blogs.id, id)).returning();
        if (!blog) return reply.status(404).send({ message: "Blog not found" });
        return blog;
    });

    // Toggle Publish
    fastify.patch("/:id/toggle-publish", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const blog = await db.query.blogs.findFirst({
            where: eq(schema.blogs.id, id),
        });

        if (!blog) return reply.status(404).send({ message: "Blog not found" });

        const [updatedBlog] = await db.update(schema.blogs)
            .set({ published: !blog.published, updatedAt: new Date() })
            .where(eq(schema.blogs.id, id))
            .returning();

        return updatedBlog;
    });

    // Delete Blog
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.blogs).where(eq(schema.blogs.id, id));
        return { success: true };
    });

    // Bulk Delete
    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorize(['SUPER_ADMIN', 'ADMIN'])]
    }, async (request) => {
        const { ids } = request.body as any;
        if (!Array.isArray(ids) || ids.length === 0) {
            return { success: false, message: "No IDs provided" };
        }
        await db.delete(schema.blogs).where(inArray(schema.blogs.id, ids));
        return { success: true, count: ids.length };
    });
};

export default blogsAdminRoutes;

