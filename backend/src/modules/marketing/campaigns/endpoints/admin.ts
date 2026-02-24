import { FastifyPluginAsync } from "fastify";
import {
    db,
    schema,
    eq,
    desc,
    ilike,
    inArray,
    and,
    or,
    asc,
    count,
} from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

type IdValue = string[] | string | null | undefined;
type CampaignInput = Record<string, unknown>;

const hasOwn = (payload: CampaignInput, key: string) =>
    Object.prototype.hasOwnProperty.call(payload, key);

const toNullableString = (value: unknown): string | null => {
    if (value === null || value === undefined) return null;
    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : null;
};

const toNullableInt = (value: unknown): number | null => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.round(parsed) : null;
};

const parseIdArray = (value: IdValue): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item).trim())
            .filter(Boolean);
    }
    const raw = String(value).trim();
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed
                .map((item) => String(item).trim())
                .filter(Boolean);
        }
    } catch {
        // Fallback to CSV below.
    }

    return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const uniqueIds = (ids: string[]) => Array.from(new Set(ids));

const serializeIds = (ids: string[]) => {
    if (ids.length === 0) return null;
    return JSON.stringify(ids);
};

const normalizeCampaignIds = (campaign: any) => {
    const productIds = parseIdArray(campaign.productIds as IdValue);
    const collectionIds = parseIdArray(campaign.collectionIds as IdValue);
    const bannerIds = parseIdArray(campaign.bannerIds as IdValue);

    return {
        ...campaign,
        productIds,
        collectionIds,
        bannerIds,
    };
};

const fetchProductsByIds = async (productIds: string[]) => {
    if (productIds.length === 0) return [];

    const records = await (db as any).query.products.findMany({
        where: inArray(schema.products.id as any, productIds),
        with: {
            assets: { with: { asset: true } },
            collections: { with: { collection: true } },
            brand: true,
        },
    });

    const byId = new Map(records.map((record: any) => [record.id, record]));
    return productIds.map((id) => byId.get(id)).filter(Boolean);
};

const getCampaignProducts = async (campaign: any) => {
    const normalizedFromJoin = await (db as any).query.campaignProducts.findMany({
        where: eq(schema.campaignProducts.campaignId as any, campaign.id),
        orderBy: [asc(schema.campaignProducts.sortOrder as any)],
        with: {
            product: {
                with: {
                    assets: { with: { asset: true } },
                    collections: { with: { collection: true } },
                    brand: true,
                },
            },
        },
    });

    if (normalizedFromJoin.length > 0) {
        const featuredProducts = normalizedFromJoin
            .map((entry: any) => entry.product)
            .filter(Boolean);

        return {
            featuredProducts,
            productIds: featuredProducts.map((product: any) => product.id),
        };
    }

    const legacyProductIds = parseIdArray(campaign.productIds as IdValue);
    const featuredProducts = await fetchProductsByIds(legacyProductIds);

    return {
        featuredProducts,
        productIds: legacyProductIds,
    };
};

const buildCampaignCreateValues = (id: string, payload: CampaignInput, productIds: string[]) => ({
    id,
    name: String(payload.name ?? ""),
    slug: String(payload.slug ?? ""),
    description: toNullableString(payload.description),
    type: String(payload.type ?? "SEASONAL"),
    status: String(payload.status ?? "DRAFT"),
    startDate: payload.startDate ? new Date(String(payload.startDate)) : new Date(),
    endDate: payload.endDate ? new Date(String(payload.endDate)) : null,
    targetAudience: toNullableString(payload.targetAudience),
    discountType: toNullableString(payload.discountType),
    discountValue: toNullableInt(payload.discountValue),
    couponCode: toNullableString(payload.couponCode),
    minPurchaseAmount: toNullableInt(payload.minPurchaseAmount),
    maxDiscountAmount: toNullableInt(payload.maxDiscountAmount),
    usageLimit: toNullableInt(payload.usageLimit),
    usagePerCustomer: toNullableInt(payload.usagePerCustomer) ?? 1,
    brevoEmailCampaignId: toNullableInt(payload.brevoEmailCampaignId),
    brevoListId: toNullableInt(payload.brevoListId),
    bannerIds: serializeIds(uniqueIds(parseIdArray(payload.bannerIds as IdValue))),
    collectionIds: serializeIds(uniqueIds(parseIdArray(payload.collectionIds as IdValue))),
    productIds: serializeIds(productIds),
    createdBy: toNullableString(payload.createdBy),
});

const buildCampaignUpdateValues = (payload: CampaignInput, productIds: string[]) => {
    const values: Record<string, unknown> = {
        updatedAt: new Date(),
    };

    if (hasOwn(payload, "name")) values.name = String(payload.name ?? "");
    if (hasOwn(payload, "slug")) values.slug = String(payload.slug ?? "");
    if (hasOwn(payload, "description")) values.description = toNullableString(payload.description);
    if (hasOwn(payload, "type")) values.type = String(payload.type ?? "SEASONAL");
    if (hasOwn(payload, "status")) values.status = String(payload.status ?? "DRAFT");
    if (hasOwn(payload, "startDate") && payload.startDate) {
        values.startDate = new Date(String(payload.startDate));
    }
    if (hasOwn(payload, "endDate")) {
        values.endDate = payload.endDate ? new Date(String(payload.endDate)) : null;
    }
    if (hasOwn(payload, "targetAudience")) values.targetAudience = toNullableString(payload.targetAudience);
    if (hasOwn(payload, "discountType")) values.discountType = toNullableString(payload.discountType);
    if (hasOwn(payload, "discountValue")) values.discountValue = toNullableInt(payload.discountValue);
    if (hasOwn(payload, "couponCode")) values.couponCode = toNullableString(payload.couponCode);
    if (hasOwn(payload, "minPurchaseAmount")) values.minPurchaseAmount = toNullableInt(payload.minPurchaseAmount);
    if (hasOwn(payload, "maxDiscountAmount")) values.maxDiscountAmount = toNullableInt(payload.maxDiscountAmount);
    if (hasOwn(payload, "usageLimit")) values.usageLimit = toNullableInt(payload.usageLimit);
    if (hasOwn(payload, "usagePerCustomer")) {
        values.usagePerCustomer = toNullableInt(payload.usagePerCustomer) ?? 1;
    }
    if (hasOwn(payload, "brevoEmailCampaignId")) {
        values.brevoEmailCampaignId = toNullableInt(payload.brevoEmailCampaignId);
    }
    if (hasOwn(payload, "brevoListId")) {
        values.brevoListId = toNullableInt(payload.brevoListId);
    }
    if (hasOwn(payload, "bannerIds")) {
        values.bannerIds = serializeIds(uniqueIds(parseIdArray(payload.bannerIds as IdValue)));
    }
    if (hasOwn(payload, "collectionIds")) {
        values.collectionIds = serializeIds(uniqueIds(parseIdArray(payload.collectionIds as IdValue)));
    }
    if (hasOwn(payload, "productIds")) {
        values.productIds = serializeIds(productIds);
    }

    return values;
};

const syncCampaignProducts = async (campaignId: string, productIds: string[]) => {
    await db.delete(schema.campaignProducts).where(eq(schema.campaignProducts.campaignId, campaignId));
    if (productIds.length === 0) return;

    await db.insert(schema.campaignProducts).values(
        productIds.map((productId, index) => ({
            id: uuidv4(),
            campaignId,
            productId,
            sortOrder: index,
        }))
    );
};

export const campaignsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    // List Campaigns
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.campaigns.manage')],
    }, async (request) => {
        const { status, type, q } = request.query as any;

        const conditions = [];
        if (status) conditions.push(eq(schema.campaigns.status as any, status));
        if (type) conditions.push(eq(schema.campaigns.type as any, type));
        if (q) {
            conditions.push(or(
                ilike(schema.campaigns.name as any, `%${q}%`),
                ilike(schema.campaigns.slug as any, `%${q}%`)
            ));
        }

        const campaigns = await db.query.campaigns.findMany({
            where: conditions.length ? and(...conditions) : undefined,
            orderBy: [desc(schema.campaigns.createdAt)],
        });

        const productCounts = await db
            .select({
                campaignId: schema.campaignProducts.campaignId,
                total: count(schema.campaignProducts.productId),
            })
            .from(schema.campaignProducts)
            .groupBy(schema.campaignProducts.campaignId);

        const productCountByCampaignId = new Map(
            productCounts.map((entry: any) => [entry.campaignId, Number(entry.total)])
        );

        return {
            campaigns: campaigns.map((campaign: any) => {
                const normalized = normalizeCampaignIds(campaign);
                const fallbackCount = normalized.productIds.length;
                const featuredProductsCount = productCountByCampaignId.get(campaign.id) ?? fallbackCount;

                return {
                    ...normalized,
                    featuredProductsCount,
                };
            }),
            success: true,
        };
    });

    // Product options for Featured Products search/filter
    fastify.get("/products", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.campaigns.manage')],
    }, async (request) => {
        const {
            q = "",
            categoryId,
            limit = 30,
            offset = 0,
            selectedIds,
        } = request.query as any;

        const selectedProductIds = uniqueIds(parseIdArray(selectedIds as IdValue));
        const conditions = [];

        const searchTerm = String(q || "").trim();
        if (searchTerm) {
            conditions.push(or(
                ilike(schema.products.name as any, `%${searchTerm}%`),
                ilike(schema.products.slug as any, `%${searchTerm}%`),
                ilike(schema.products.sku as any, `%${searchTerm}%`)
            ));
        }

        if (categoryId) {
            conditions.push(
                inArray(
                    schema.products.id as any,
                    db.select({ id: schema.productCollections.productId as any })
                        .from(schema.productCollections as any)
                        .where(eq(schema.productCollections.collectionId as any, categoryId))
                )
            );
        }

        const filteredProducts = await (db as any).query.products.findMany({
            limit: Number(limit),
            offset: Number(offset),
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: [desc(schema.products.createdAt as any)],
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                brand: true,
            },
        });

        const filteredSet = new Set(filteredProducts.map((product: any) => product.id));
        const missingSelectedIds = selectedProductIds.filter((id) => !filteredSet.has(id));
        const selectedProducts = await fetchProductsByIds(missingSelectedIds);
        const mergedProducts = [...selectedProducts, ...filteredProducts];

        return {
            products: mergedProducts,
            success: true,
        };
    });

    // New Campaign
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.campaigns.manage')],
    }, async (request) => {
        const payload = request.body as CampaignInput;
        const id = uuidv4();
        const productIds = uniqueIds(parseIdArray(payload.productIds as IdValue));

        const values = buildCampaignCreateValues(id, payload, productIds);
        const [campaign] = await db.insert(schema.campaigns).values(values as any).returning();

        await syncCampaignProducts(campaign.id, productIds);

        const { featuredProducts } = await getCampaignProducts(campaign);

        await fastify.cache.invalidateTags(["campaigns", "products"]);

        return {
            campaign: {
                ...normalizeCampaignIds(campaign),
                featuredProducts,
                featuredProductsCount: featuredProducts.length,
            },
            success: true,
        };
    });

    fastify.get("/search", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.campaigns.manage')],
    }, async (request) => {
        const { q } = request.query as any;
        const searchTerm = String(q || "").trim();

        if (!searchTerm) {
            return { campaigns: [], success: true };
        }

        const results = await db.query.campaigns.findMany({
            where: or(
                ilike(schema.campaigns.name as any, `%${searchTerm}%`),
                ilike(schema.campaigns.slug as any, `%${searchTerm}%`)
            ),
            orderBy: [desc(schema.campaigns.createdAt)],
        });

        return {
            campaigns: results.map((campaign: any) => normalizeCampaignIds(campaign)),
            success: true,
        };
    });

    fastify.get("/:id/send-payload", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.campaigns.manage')],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const campaign = await db.query.campaigns.findFirst({
            where: eq(schema.campaigns.id, id),
        });

        if (!campaign) return reply.status(404).send({ message: "Campaign not found" });

        const normalized = normalizeCampaignIds(campaign);
        const { featuredProducts, productIds } = await getCampaignProducts(campaign);

        const payload = {
            campaignId: campaign.id,
            name: campaign.name,
            slug: campaign.slug,
            status: campaign.status,
            type: campaign.type,
            targetAudience: campaign.targetAudience,
            schedule: {
                startDate: campaign.startDate,
                endDate: campaign.endDate,
            },
            discount: {
                type: campaign.discountType,
                value: campaign.discountValue,
                couponCode: campaign.couponCode,
                minPurchaseAmount: campaign.minPurchaseAmount,
                maxDiscountAmount: campaign.maxDiscountAmount,
            },
            featuredProducts: featuredProducts.map((product: any) => ({
                id: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                salePrice: product.salePrice,
                originalPrice: product.originalPrice,
            })),
        };

        return {
            campaign: {
                ...normalized,
                productIds,
                featuredProducts,
                featuredProductsCount: productIds.length,
            },
            payload,
            success: true,
        };
    });

    fastify.post("/:id/send", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.campaigns.manage')],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const body = request.body as Record<string, unknown>;

        const campaign = await db.query.campaigns.findFirst({
            where: eq(schema.campaigns.id, id),
        });
        if (!campaign) return reply.status(404).send({ message: "Campaign not found" });

        const scheduledAtRaw = toNullableString(body.scheduledAt);
        const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : null;
        const status = scheduledAt && scheduledAt.getTime() > Date.now() ? "SCHEDULED" : "ACTIVE";

        const updateValues: Record<string, unknown> = {
            status,
            updatedAt: new Date(),
        };

        if (scheduledAt) {
            updateValues.startDate = scheduledAt;
        }
        if (hasOwn(body, "brevoEmailCampaignId")) {
            updateValues.brevoEmailCampaignId = toNullableInt(body.brevoEmailCampaignId);
        }
        if (hasOwn(body, "brevoListId")) {
            updateValues.brevoListId = toNullableInt(body.brevoListId);
        }

        const [updatedCampaign] = await db
            .update(schema.campaigns)
            .set(updateValues as any)
            .where(eq(schema.campaigns.id, id))
            .returning();

        const { featuredProducts, productIds } = await getCampaignProducts(updatedCampaign);

        await fastify.cache.invalidateTags(["campaigns", "products"]);

        return {
            campaign: {
                ...normalizeCampaignIds(updatedCampaign),
                productIds,
                featuredProducts,
                featuredProductsCount: productIds.length,
            },
            dispatch: {
                queued: true,
                channel: toNullableString(body.channel) || "EMAIL",
                scheduledAt,
                message: status === "SCHEDULED"
                    ? "Campaign scheduled successfully."
                    : "Campaign marked as active for sending.",
            },
            success: true,
        };
    });

    // Show Campaign
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.campaigns.manage')],
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const campaign = await db.query.campaigns.findFirst({
            where: eq(schema.campaigns.id, id),
        });
        if (!campaign) return reply.status(404).send({ message: "Campaign not found" });

        const normalized = normalizeCampaignIds(campaign);
        const { featuredProducts, productIds } = await getCampaignProducts(campaign);

        return {
            campaign: {
                ...normalized,
                productIds,
                featuredProducts,
                featuredProductsCount: productIds.length,
            },
            success: true,
        };
    });

    // Edit Campaign Handler
    const updateCampaignHandler = async (request: any, reply: any) => {
        const { id } = request.params as { id: string };
        const payload = request.body as CampaignInput;
        const productIds = uniqueIds(parseIdArray(payload.productIds as IdValue));
        const values = buildCampaignUpdateValues(payload, productIds);

        const [campaign] = await db
            .update(schema.campaigns)
            .set(values as any)
            .where(eq(schema.campaigns.id, id))
            .returning();

        if (!campaign) return reply.status(404).send({ message: "Campaign not found" });

        if (hasOwn(payload, "productIds")) {
            await syncCampaignProducts(id, productIds);
        }

        const { featuredProducts, productIds: resolvedProductIds } = await getCampaignProducts(campaign);

        await fastify.cache.invalidateTags(["campaigns", "products"]);

        return {
            campaign: {
                ...normalizeCampaignIds(campaign),
                productIds: resolvedProductIds,
                featuredProducts,
                featuredProductsCount: resolvedProductIds.length,
            },
            success: true,
        };
    };

    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.campaigns.manage')],
    }, updateCampaignHandler);

    fastify.patch("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.campaigns.manage')],
    }, updateCampaignHandler);

    // Delete Campaign
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.campaigns.manage')],
    }, async (request) => {
        const { id } = request.params as { id: string };
        await db.delete(schema.campaigns).where(eq(schema.campaigns.id, id));
        await fastify.cache.invalidateTags(["campaigns", "products"]);
        return { success: true };
    });

    // Bulk Delete
    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('marketing.campaigns.manage')],
    }, async (request) => {
        const { ids } = request.body as { ids?: string[] };
        if (!Array.isArray(ids) || ids.length === 0) {
            return { success: false, message: "No IDs provided" };
        }
        await db.delete(schema.campaigns).where(inArray(schema.campaigns.id, ids));
        await fastify.cache.invalidateTags(["campaigns", "products"]);
        return { success: true, count: ids.length };
    });
};

export default campaignsAdminRoutes;

