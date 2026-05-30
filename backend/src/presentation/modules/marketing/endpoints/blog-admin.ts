import { FastifyPluginAsync } from 'fastify';
import { v4 as uuidv4 } from "uuid";
import { db, schema, eq, desc, ilike, and } from '@workit/db';

export const blogAdminRoutes: FastifyPluginAsync = async (fastify) => {
  const preAdmin = [fastify.authenticate, fastify.authorizePermission('marketing.content.manage')];

  const withAsset = {
    asset: {
      columns: { id: true, name: true, source: true, preview: true },
    },
  };

  fastify.get('/', { preHandler: preAdmin }, async (request) => {
    const { limit = 50, offset = 0, published, search } = request.query as any;
    const conditions: any[] = [];
    if (published !== undefined) conditions.push(eq(schema.blogs.published, published === 'true'));
    if (search) conditions.push(ilike(schema.blogs.title, `%${search}%`));

    const blogs = await db.query.blogs.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: Number(limit),
      offset: Number(offset),
      orderBy: [desc(schema.blogs.createdAt)],
      with: withAsset,
    });

    return { blogs };
  });

  fastify.get('/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const blog = await db.query.blogs.findFirst({
      where: eq(schema.blogs.id, id),
      with: withAsset,
    });

    if (!blog) return reply.status(404).send({ message: 'Blog not found' });
    return blog;
  });

  fastify.get('/slug/:slug', { preHandler: preAdmin }, async (request, reply) => {
    const { slug } = request.params as any;
    const blog = await db.query.blogs.findFirst({
      where: eq(schema.blogs.slug, slug),
      with: withAsset,
    });

    if (!blog) return reply.status(404).send({ message: 'Blog not found' });
    return blog;
  });

  fastify.post('/', { preHandler: preAdmin }, async (request, reply) => {
    try {
      const data = request.body as any;
      const id = uuidv4();
      const now = new Date();

      const [blog] = await db.insert(schema.blogs).values({
        id,
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        content: data.content || '',
        excerpt: data.excerpt || null,
        author: data.author || null,
        published: data.published ?? false,
        publishedAt: data.published ? now : null,
        assetId: data.assetId || null,
        createdAt: now,
        updatedAt: now,
      }).returning();

      await fastify.cache?.invalidateTags?.(['blogs']);
      return blog;
    } catch (error: any) {
      if (error.cause?.code === '23505' || error.message?.includes('Blog_slug_unique')) {
        return reply.status(400).send({ success: false, message: 'A blog post with this slug already exists.' });
      }
      throw error;
    }
  });

  fastify.put('/:id', { preHandler: preAdmin }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const data = request.body as any;
      const now = new Date();

      const existing = await db.query.blogs.findFirst({ where: eq(schema.blogs.id, id) });
      if (!existing) return reply.status(404).send({ message: 'Blog not found' });

      const updateData: any = { updatedAt: now };
      if (data.title !== undefined) updateData.title = data.title;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
      if (data.author !== undefined) updateData.author = data.author;
      if (data.assetId !== undefined) updateData.assetId = data.assetId;
      if (data.published !== undefined) {
        updateData.published = data.published;
        updateData.publishedAt = data.published ? (existing.publishedAt || now) : null;
      }

      const [blog] = await db.update(schema.blogs)
        .set(updateData)
        .where(eq(schema.blogs.id, id))
        .returning();

      await fastify.cache?.invalidateTags?.(['blogs']);
      return blog;
    } catch (error: any) {
      if (error.cause?.code === '23505' || error.message?.includes('Blog_slug_unique')) {
        return reply.status(400).send({ success: false, message: 'A blog post with this slug already exists.' });
      }
      throw error;
    }
  });

  fastify.patch('/:id/toggle-publish', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const now = new Date();

    const existing = await db.query.blogs.findFirst({ where: eq(schema.blogs.id, id) });
    if (!existing) return reply.status(404).send({ message: 'Blog not found' });

    const newPublished = !existing.published;
    const [blog] = await db.update(schema.blogs)
      .set({
        published: newPublished,
        publishedAt: newPublished ? (existing.publishedAt || now) : null,
        updatedAt: now,
      })
      .where(eq(schema.blogs.id, id))
      .returning();

    await fastify.cache?.invalidateTags?.(['blogs']);
    return blog;
  });

  fastify.delete('/:id', { preHandler: preAdmin }, async (request) => {
    const { id } = request.params as any;
    await db.delete(schema.blogs).where(eq(schema.blogs.id, id));
    await fastify.cache?.invalidateTags?.(['blogs']);
    return { success: true };
  });
};
