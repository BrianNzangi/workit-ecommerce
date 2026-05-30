import { FastifyPluginAsync } from 'fastify';
import { v4 as uuidv4 } from "uuid";
import { db, schema, eq, desc, asc, ilike, and, inArray } from '@workit/db';

export const bannerAdminRoutes: FastifyPluginAsync = async (fastify) => {
  const preAdmin = [fastify.authenticate, fastify.authorizePermission('marketing.content.manage')];

  const withRelations = {
    desktopImage: {
      columns: { id: true, name: true, source: true, preview: true },
    },
    mobileImage: {
      columns: { id: true, name: true, source: true, preview: true },
    },
    collection: {
      columns: { id: true, name: true, slug: true },
    },
    product: {
      columns: { id: true, name: true, slug: true },
    },
    campaign: {
      columns: { id: true, name: true, slug: true },
    },
  };

  fastify.get('/', { preHandler: preAdmin }, async (request) => {
    const { limit = 50, offset = 0, position, enabled, search } = request.query as any;
    const conditions: any[] = [];
    if (position) conditions.push(eq(schema.banners.position, position));
    if (enabled !== undefined) conditions.push(eq(schema.banners.enabled, enabled === 'true'));
    if (search) conditions.push(ilike(schema.banners.title, `%${search}%`));

    const banners = await db.query.banners.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: Number(limit),
      offset: Number(offset),
      orderBy: [desc(schema.banners.createdAt)],
      with: withRelations,
    });

    return { banners };
  });

  fastify.get('/search', { preHandler: preAdmin }, async (request) => {
    const { q } = request.query as any;
    if (!q) return { banners: [] };

    const banners = await db.query.banners.findMany({
      where: ilike(schema.banners.title, `%${q}%`),
      limit: 20,
      orderBy: [asc(schema.banners.title)],
    });

    return { banners };
  });

  fastify.get('/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const banner = await db.query.banners.findFirst({
      where: eq(schema.banners.id, id),
      with: withRelations,
    });

    if (!banner) return reply.status(404).send({ message: 'Banner not found' });
    return banner;
  });

  fastify.post('/', { preHandler: preAdmin }, async (request, reply) => {
    try {
      const data = request.body as any;
      const id = uuidv4();
      const now = new Date();

      const [banner] = await db.insert(schema.banners).values({
        id,
        title: data.title,
        description: data.description || null,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        position: data.position,
        enabled: data.enabled ?? true,
        sortOrder: data.sortOrder ?? 0,
        desktopImageId: data.desktopImageId || null,
        mobileImageId: data.mobileImageId || null,
        collectionId: data.collectionId || null,
        productId: data.productId || null,
        campaignId: data.campaignId || null,
        createdAt: now,
        updatedAt: now,
      }).returning();

      await fastify.cache?.invalidateTags?.(['banners']);
      return { banner };
    } catch (error: any) {
      if (error.cause?.code === '23505' || error.message?.includes('Banner_slug_unique')) {
        return reply.status(400).send({ success: false, message: 'A banner with this slug already exists.' });
      }
      throw error;
    }
  });

  fastify.put('/:id', { preHandler: preAdmin }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const data = request.body as any;
      const now = new Date();

      const existing = await db.query.banners.findFirst({ where: eq(schema.banners.id, id) });
      if (!existing) return reply.status(404).send({ message: 'Banner not found' });

      const updateData: any = { updatedAt: now };
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.position !== undefined) updateData.position = data.position;
      if (data.enabled !== undefined) updateData.enabled = data.enabled;
      if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
      if (data.desktopImageId !== undefined) updateData.desktopImageId = data.desktopImageId;
      if (data.mobileImageId !== undefined) updateData.mobileImageId = data.mobileImageId;
      if (data.collectionId !== undefined) updateData.collectionId = data.collectionId;
      if (data.productId !== undefined) updateData.productId = data.productId;
      if (data.campaignId !== undefined) updateData.campaignId = data.campaignId;

      const [banner] = await db.update(schema.banners)
        .set(updateData)
        .where(eq(schema.banners.id, id))
        .returning();

      await fastify.cache?.invalidateTags?.(['banners']);
      return { banner };
    } catch (error: any) {
      if (error.cause?.code === '23505' || error.message?.includes('Banner_slug_unique')) {
        return reply.status(400).send({ success: false, message: 'A banner with this slug already exists.' });
      }
      throw error;
    }
  });

  fastify.delete('/:id', { preHandler: preAdmin }, async (request) => {
    const { id } = request.params as any;
    await db.delete(schema.banners).where(eq(schema.banners.id, id));
    await fastify.cache?.invalidateTags?.(['banners']);
    return { success: true };
  });

  fastify.post('/bulk-delete', { preHandler: preAdmin }, async (request) => {
    const { ids } = request.body as any;
    if (!ids?.length) return { success: false, message: 'No IDs provided' };

    await db.delete(schema.banners).where(inArray(schema.banners.id, ids));
    await fastify.cache?.invalidateTags?.(['banners']);
    return { success: true, deletedCount: ids.length };
  });
};
