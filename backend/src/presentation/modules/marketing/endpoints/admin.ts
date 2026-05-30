import { FastifyPluginAsync } from 'fastify';
import { v4 as uuidv4 } from "uuid";
import { db, schema, eq, desc, ilike, and, or, inArray } from '@workit/db';

export const campaignAdminRoutes: FastifyPluginAsync = async (fastify) => {
  const preAdmin = [fastify.authenticate, fastify.authorizePermission('marketing.content.manage')];

  const campaignRelations = {
    campaignProducts: { with: { product: true } },
  };

  fastify.get('/', { preHandler: preAdmin }, async (request) => {
    const { limit = 50, offset = 0, status, type, q } = request.query as any;
    const conditions: any[] = [];
    if (status) conditions.push(eq(schema.campaigns.status, status));
    if (type) conditions.push(eq(schema.campaigns.type, type));
    if (q) conditions.push(ilike(schema.campaigns.name, `%${q}%`));

    const campaigns = await db.query.campaigns.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: Number(limit),
      offset: Number(offset),
      orderBy: [desc(schema.campaigns.createdAt)],
      with: { campaignProducts: { with: { product: true } } },
    });

    const total = await db.$count(
      schema.campaigns,
      conditions.length > 0 ? and(...conditions) : undefined,
    );

    return { campaigns, total, success: true };
  });

  fastify.get('/search', { preHandler: preAdmin }, async (request) => {
    const { q } = request.query as any;
    if (!q) return { campaigns: [], success: true };
    const campaigns = await db.query.campaigns.findMany({
      where: ilike(schema.campaigns.name, `%${q}%`),
      limit: 20,
      with: { campaignProducts: { with: { product: true } } },
    });
    return { campaigns, success: true };
  });

  fastify.post('/', { preHandler: preAdmin }, async (request) => {
    const body = request.body as any;
    const id = uuidv4();
    const { productIds, ...fields } = body;

    const [campaign] = await db.insert(schema.campaigns).values({
      id,
      ...fields,
      bannerIds: fields.bannerIds ? JSON.stringify(fields.bannerIds) : null,
      collectionIds: fields.collectionIds ? JSON.stringify(fields.collectionIds) : null,
      productIds: productIds ? JSON.stringify(productIds) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      await db.insert(schema.campaignProducts).values(
        productIds.map((pid: string, i: number) => ({
          id: uuidv4(),
          campaignId: id,
          productId: pid,
          sortOrder: i,
        })),
      );
    }

    await fastify.cache?.invalidateTags?.(['campaigns']);
    return { campaign, success: true };
  });

  fastify.get('/products', { preHandler: preAdmin }, async (request) => {
    const { q, limit = 50, offset = 0 } = request.query as any;
    const conditions: any[] = [eq(schema.products.enabled, true)];
    if (q) conditions.push(ilike(schema.products.name, `%${q}%`));

    const products = await db.query.products.findMany({
      where: and(...conditions),
      limit: Number(limit),
      offset: Number(offset),
      columns: {
        id: true, name: true, slug: true, sku: true,
        salePrice: true, originalPrice: true, enabled: true,
      },
      with: {
        assets: { with: { asset: { columns: { id: true, source: true, preview: true } } } },
        collections: { with: { collection: { columns: { id: true, name: true, slug: true } } } },
        brand: { columns: { id: true, name: true, slug: true } },
      },
    });

    return { products, success: true };
  });

  fastify.get('/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const campaign = await db.query.campaigns.findFirst({
      where: eq(schema.campaigns.id, id),
      with: { campaignProducts: { with: { product: true } } },
    });
    if (!campaign) return reply.status(404).send({ message: 'Campaign not found' });
    return { campaign, success: true };
  });

  fastify.put('/:id', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const body = request.body as any;
    const { productIds, ...fields } = body;

    const updateData: any = { ...fields, updatedAt: new Date() };
    if (fields.bannerIds !== undefined) updateData.bannerIds = JSON.stringify(fields.bannerIds);
    if (fields.collectionIds !== undefined) updateData.collectionIds = JSON.stringify(fields.collectionIds);
    if (productIds !== undefined) updateData.productIds = JSON.stringify(productIds);

    const [campaign] = await db
      .update(schema.campaigns)
      .set(updateData)
      .where(eq(schema.campaigns.id, id))
      .returning();

    if (!campaign) return reply.status(404).send({ message: 'Campaign not found' });

    if (productIds !== undefined) {
      await db.delete(schema.campaignProducts).where(eq(schema.campaignProducts.campaignId, id));
      if (Array.isArray(productIds) && productIds.length > 0) {
        await db.insert(schema.campaignProducts).values(
          productIds.map((pid: string, i: number) => ({
            id: uuidv4(),
            campaignId: id,
            productId: pid,
            sortOrder: i,
          })),
        );
      }
    }

    await fastify.cache?.invalidateTags?.(['campaigns']);
    return { campaign, success: true };
  });

  fastify.delete('/:id', { preHandler: preAdmin }, async (request) => {
    const { id } = request.params as any;
    await db.delete(schema.campaigns).where(eq(schema.campaigns.id, id));
    await fastify.cache?.invalidateTags?.(['campaigns']);
    return { success: true };
  });

  fastify.post('/bulk-delete', { preHandler: preAdmin }, async (request) => {
    const { ids } = request.body as any;
    if (!Array.isArray(ids) || ids.length === 0) return { success: false };
    await db.delete(schema.campaigns).where(inArray(schema.campaigns.id, ids));
    await fastify.cache?.invalidateTags?.(['campaigns']);
    return { success: true, count: ids.length };
  });

  fastify.get('/:id/send-payload', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const campaign = await db.query.campaigns.findFirst({
      where: eq(schema.campaigns.id, id),
      with: { campaignProducts: { with: { product: true } } },
    });
    if (!campaign) return reply.status(404).send({ message: 'Campaign not found' });

    const payload = {
      campaignId: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      status: campaign.status,
      type: campaign.type,
      targetAudience: campaign.targetAudience,
      schedule: { startDate: campaign.startDate, endDate: campaign.endDate },
      discount: {
        type: campaign.discountType,
        value: campaign.discountValue,
        couponCode: campaign.couponCode,
        minPurchaseAmount: campaign.minPurchaseAmount,
        maxDiscountAmount: campaign.maxDiscountAmount,
      },
      featuredProducts: (campaign.campaignProducts || []).map((cp: any) => ({
        id: cp.product?.id,
        name: cp.product?.name,
        slug: cp.product?.slug,
        sku: cp.product?.sku,
        salePrice: cp.product?.salePrice,
        originalPrice: cp.product?.originalPrice,
      })),
    };

    return { campaign, payload, success: true };
  });

  fastify.post('/:id/send', { preHandler: preAdmin }, async (request, reply) => {
    const { id } = request.params as any;
    const campaign = await db.query.campaigns.findFirst({ where: eq(schema.campaigns.id, id) });
    if (!campaign) return reply.status(404).send({ message: 'Campaign not found' });

    await db
      .update(schema.campaigns)
      .set({ status: 'ACTIVE', updatedAt: new Date() })
      .where(eq(schema.campaigns.id, id));

    await fastify.cache?.invalidateTags?.(['campaigns']);

    return {
      campaign: { ...campaign, status: 'ACTIVE' },
      dispatch: { sent: true, channel: 'internal', note: 'Brevo integration removed; campaign marked as active' },
      success: true,
    };
  });
};
