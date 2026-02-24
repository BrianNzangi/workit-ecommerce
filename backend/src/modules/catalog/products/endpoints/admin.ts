import { FastifyPluginAsync } from "fastify";
import { db, schema, eq, desc, inArray, and, or, ilike, gte, lte, gt, sql, count } from "../../../../lib/db.js";
import { v4 as uuidv4 } from "uuid";
import { productSearchService } from "../../../../services/search/product-search.service.js";

const normalizeCampaignDate = (value: unknown): Date | null => {
    if (!value) return null;
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const enrichProductCampaigns = (product: any, onlyActive = false) => {
    const now = new Date();
    const campaignRows = Array.isArray(product?.campaignProducts) ? product.campaignProducts : [];
    const campaigns = campaignRows
        .map((row: any) => row?.campaign)
        .filter(Boolean)
        .filter((campaign: any) => {
            if (!onlyActive) return true;
            if (campaign.status !== "ACTIVE") return false;

            const startsAt = normalizeCampaignDate(campaign.startDate);
            const endsAt = normalizeCampaignDate(campaign.endDate);
            if (startsAt && startsAt > now) return false;
            if (endsAt && endsAt < now) return false;
            return true;
        });

    const dedupedCampaigns = Array.from(
        new Map(campaigns.map((campaign: any) => [campaign.id, campaign])).values()
    );

    const campaignTypes = Array.from(
        new Set(dedupedCampaigns.map((campaign: any) => campaign.type).filter(Boolean))
    );
    const discountTypes = Array.from(
        new Set(dedupedCampaigns.map((campaign: any) => campaign.discountType).filter(Boolean))
    );

    return {
        ...product,
        campaigns: dedupedCampaigns.map((campaign: any) => ({
            id: campaign.id,
            name: campaign.name,
            slug: campaign.slug,
            type: campaign.type,
            discountType: campaign.discountType,
            status: campaign.status,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
        })),
        campaignTypes,
        campaignType: campaignTypes[0] || null,
        discountTypes,
        discountType: discountTypes[0] || null,
        campaignProducts: undefined,
    };
};

const enrichProductsWithCampaigns = (products: any[], onlyActive = false) =>
    products.map((product: any) => enrichProductCampaigns(product, onlyActive));

export const productsAdminRoutes: FastifyPluginAsync = async (fastify) => {
    const runSearchSyncSafely = async (job: { type: string; payload: any }, context: string) => {
        try {
            await fastify.jobs.enqueue(job as any);
        } catch (error) {
            fastify.log.error({ error, context }, "Product search index sync failed");
        }
    };

    // List Products (Admin view might include more details)
    fastify.get("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (request) => {
        const {
            limit = 50,
            offset,
            page,
            collectionId,
            brandId,
            enabled,
            q,
            condition,
            stockStatus,
            minPrice,
            maxPrice,
            includeTotalAll,
        } = request.query as any;

        const parsedLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
        const parsedOffset = Number.isFinite(Number(offset))
            ? Math.max(Number(offset), 0)
            : Math.max((Number(page) || 1) - 1, 0) * parsedLimit;

        const conditions = [];

        if (enabled !== undefined) {
            conditions.push(eq(schema.products.enabled as any, enabled === 'true'));
        }

        if (brandId) {
            conditions.push(eq(schema.products.brandId as any, brandId));
        }

        if (collectionId) {
            conditions.push(inArray(
                schema.products.id as any,
                db.select({ id: schema.productCollections.productId as any })
                    .from(schema.productCollections as any)
                    .where(eq(schema.productCollections.collectionId as any, collectionId))
            ));
        }

        const searchTerm = String(q || "").trim();
        if (searchTerm) {
            conditions.push(or(
                ilike(schema.products.name as any, `%${searchTerm}%`),
                ilike(schema.products.slug as any, `%${searchTerm}%`),
                ilike(schema.products.sku as any, `%${searchTerm}%`)
            ));
        }

        if (condition) {
            conditions.push(eq(schema.products.condition as any, condition));
        }

        if (stockStatus) {
            const stockExpr = sql<number>`coalesce(${schema.products.stockOnHand}, 0)`;
            if (stockStatus === "in_stock") {
                conditions.push(gt(stockExpr, 0));
            } else if (stockStatus === "low_stock") {
                conditions.push(and(gt(stockExpr, 0), lte(stockExpr, 10)));
            } else if (stockStatus === "out_of_stock") {
                conditions.push(eq(stockExpr, 0));
            }
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            const priceExpr = sql<number>`coalesce(${schema.products.salePrice}, ${schema.products.originalPrice}, 0)`;
            const min = Number(minPrice);
            const max = Number(maxPrice);
            if (Number.isFinite(min)) {
                conditions.push(gte(priceExpr, min));
            }
            if (Number.isFinite(max)) {
                conditions.push(lte(priceExpr, max));
            }
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const totalCountQuery = db
            .select({ count: count() })
            .from(schema.products as any);
        if (whereClause) {
            totalCountQuery.where(whereClause);
        }
        const [{ count: totalCount }] = await totalCountQuery;

        let totalAll: number | undefined;
        if (includeTotalAll === "true" || includeTotalAll === true) {
            const [{ count: totalAllCount }] = await db
                .select({ count: count() })
                .from(schema.products as any);
            totalAll = Number(totalAllCount || 0);
        }

        const results = await (db as any).query.products.findMany({
            limit: parsedLimit,
            offset: parsedOffset,
            where: whereClause,
            orderBy: [desc(schema.products.createdAt as any)],
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                homepageCollections: { with: { collection: true } },
                brand: true,
                campaignProducts: { with: { campaign: true } },
            },
        });
        return {
            products: enrichProductsWithCampaigns(results),
            success: true,
            total: Number(totalCount || 0),
            totalAll,
            limit: parsedLimit,
            offset: parsedOffset,
        };
    });

    // New Product
    fastify.post("/", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (request, reply) => {
        const { collections: collectionIds, assetIds, homepageCollections: homepageCollectionIds, ...productData } = request.body as any;
        const id = uuidv4();

        const existingBySlug = await (db as any).query.products.findFirst({
            where: eq(schema.products.slug as any, productData.slug),
        });
        if (existingBySlug) return reply.status(400).send({ message: "Product with this slug already exists" });

        const [product] = await db.insert(schema.products as any).values({ ...productData, id }).returning();

        if (collectionIds && collectionIds.length > 0) {
            await db.insert(schema.productCollections as any).values(
                collectionIds.map((collectionId: string) => ({
                    id: uuidv4(),
                    productId: product.id,
                    collectionId,
                }))
            );
        }

        if (assetIds && assetIds.length > 0) {
            await db.insert(schema.productAssets as any).values(
                assetIds.map((assetId: string, index: number) => ({
                    id: uuidv4(),
                    productId: product.id,
                    assetId,
                    sortOrder: index,
                }))
            );
        }

        if (homepageCollectionIds && homepageCollectionIds.length > 0) {
            await db.insert(schema.homepageCollectionProducts as any).values(
                homepageCollectionIds.map((hcid: string, index: number) => ({
                    id: uuidv4(),
                    productId: product.id,
                    collectionId: hcid,
                    sortOrder: index
                }))
            );
        }

        await runSearchSyncSafely(
            { type: "search.sync", payload: { productIds: [product.id] } },
            `create:${product.id}`
        );

        await fastify.cache.invalidateTags(["products", "homepage-collections"]);

        return { product, success: true };
    });

    // Search Products (Admin)
    fastify.get("/search", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (request) => {
        const { q, limit = 50 } = request.query as any;
        const results = await productSearchService.searchAdminProducts(String(q || ""), Number(limit) || 50);
        return { products: results, success: true };
    });

    fastify.post("/search/reindex", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async () => {
        await runSearchSyncSafely(
            { type: "search.reindex", payload: {} },
            "reindex"
        );
        return { success: true, queued: true };
    });

    // Show Product (Admin)
    fastify.get("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (request, reply) => {
        const { id } = request.params as any;
        const product = await (db as any).query.products.findFirst({
            where: eq(schema.products.id as any, id),
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                homepageCollections: { with: { collection: true } },
                brand: true,
                campaignProducts: { with: { campaign: true } },
            },
        });
        if (!product) return reply.status(404).send({ message: "Product not found" });
        return { product: enrichProductCampaigns(product), success: true };
    });

    // Update Handler
    const updateProductHandler = async (request: any, reply: any) => {
        const { id } = request.params as any;
        const { collections: collectionIds, assetIds, homepageCollections: homepageCollectionIds, ...productData } = request.body as any;

        const [product] = await db
            .update(schema.products as any)
            .set({ ...productData, updatedAt: new Date() })
            .where(eq(schema.products.id as any, id))
            .returning();

        if (!product) return reply.status(404).send({ message: "Product not found" });

        if (collectionIds !== undefined) {
            await db.delete(schema.productCollections as any).where(eq(schema.productCollections.productId as any, id));
            if (collectionIds.length > 0) {
                await db.insert(schema.productCollections as any).values(
                    collectionIds.map((cid: string) => ({ id: uuidv4(), productId: id, collectionId: cid }))
                );
            }
        }

        if (assetIds !== undefined) {
            await db.delete(schema.productAssets as any).where(eq(schema.productAssets.productId as any, id));
            if (assetIds.length > 0) {
                await db.insert(schema.productAssets as any).values(
                    assetIds.map((aid: string, index: number) => ({ id: uuidv4(), productId: id, assetId: aid, sortOrder: index }))
                );
            }
        }

        if (homepageCollectionIds !== undefined) {
            await db.delete(schema.homepageCollectionProducts as any).where(eq(schema.homepageCollectionProducts.productId as any, id));
            if (homepageCollectionIds.length > 0) {
                await db.insert(schema.homepageCollectionProducts as any).values(
                    homepageCollectionIds.map((hcid: string, index: number) => ({
                        id: uuidv4(),
                        productId: id,
                        collectionId: hcid,
                        sortOrder: index
                    }))
                );
            }
        }

        await runSearchSyncSafely(
            { type: "search.sync", payload: { productIds: [id] } },
            `update:${id}`
        );

        await fastify.cache.invalidateTags(["products", "homepage-collections"]);

        return { product, success: true };
    };

    // Edit Product
    fastify.put("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, updateProductHandler);

    // Edit Product (PATCH Alias)
    fastify.patch("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, updateProductHandler);

    // Delete Product
    fastify.delete("/:id", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (request) => {
        const { id } = request.params as any;
        await db.delete(schema.products as any).where(eq(schema.products.id as any, id));
        await runSearchSyncSafely(
            { type: "search.delete", payload: { productIds: [id] } },
            `delete:${id}`
        );

        await fastify.cache.invalidateTags(["products", "homepage-collections"]);
        return { success: true };
    });

    // Bulk Delete
    fastify.post("/bulk-delete", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (request) => {
        const { ids } = request.body as any;
        if (!Array.isArray(ids) || ids.length === 0) {
            return { success: false, message: "No IDs provided" };
        }
        await db.delete(schema.products as any).where(inArray(schema.products.id as any, ids));
        await runSearchSyncSafely(
            { type: "search.delete", payload: { productIds: ids } },
            `bulk-delete:${ids.length}`
        );

        await fastify.cache.invalidateTags(["products", "homepage-collections"]);
        return { success: true, count: ids.length };
    });

    // ─── Download CSV Template ────────────────────────────────────
    fastify.get("/template", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (_request, reply) => {
        const headers = [
            'name', 'slug', 'sku', 'description', 'salePrice', 'originalPrice',
            'stockOnHand', 'enabled', 'condition', 'brandSlug', 'collections', 'vat', 'vatInclusive'
        ];

        const sampleRow = [
            'Example Product', 'example-product', 'SKU-001', 'Product description here',
            '1500', '2000', '20', 'true', 'NEW', 'brand-slug', 'collection-slug-1|collection-slug-2',
            '16', 'true'
        ];

        const csv = headers.join(',') + '\n' + sampleRow.join(',') + '\n';

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', 'attachment; filename="product-import-template.csv"');
        return reply.send(csv);
    });

    // ─── Export Products as CSV ───────────────────────────────────
    fastify.get("/export", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (_request, reply) => {
        const allProducts = await (db as any).query.products.findMany({
            orderBy: [desc(schema.products.createdAt as any)],
            with: {
                collections: { with: { collection: true } },
                brand: true,
            },
        });

        const headers = [
            'name', 'slug', 'sku', 'description', 'salePrice', 'originalPrice',
            'stockOnHand', 'enabled', 'condition', 'brandSlug', 'collections', 'vat', 'vatInclusive'
        ];

        const escapeCSV = (val: any) => {
            const str = val === null || val === undefined ? '' : String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const rows = allProducts.map((p: any) => [
            escapeCSV(p.name),
            escapeCSV(p.slug),
            escapeCSV(p.sku),
            escapeCSV(p.description),
            escapeCSV(p.salePrice),
            escapeCSV(p.originalPrice),
            escapeCSV(p.stockOnHand),
            escapeCSV(p.enabled),
            escapeCSV(p.condition),
            escapeCSV(p.brand?.slug || ''),
            escapeCSV((p.collections || []).map((pc: any) => pc.collection?.slug).filter(Boolean).join('|')),
            escapeCSV(p.vat),
            escapeCSV(p.vatInclusive),
        ].join(','));

        const csv = headers.join(',') + '\n' + rows.join('\n') + '\n';

        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="products-export-${Date.now()}.csv"`);
        return reply.send(csv);
    });

    // ─── Import Products from CSV data ───────────────────────────
    fastify.post("/import", {
        preHandler: [fastify.authenticate, fastify.authorizePermission('catalog.manage')]
    }, async (request, reply) => {
        const { csvData } = request.body as { csvData: any[] };

        if (!Array.isArray(csvData) || csvData.length === 0) {
            return reply.status(400).send({ error: 'No data provided' });
        }

        // Pre-fetch brands and collections for lookup
        const allBrands = await (db as any).query.brands.findMany();
        const allCollections = await (db as any).query.collections.findMany();

        const brandBySlug = new Map(allBrands.map((b: any) => [b.slug, b.id]));
        const collectionBySlug = new Map(allCollections.map((c: any) => [c.slug, c.id]));

        let created = 0;
        let updated = 0;
        let skipped = 0;
        const errors: string[] = [];
        const touchedProductIds = new Set<string>();

        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            try {
                if (!row.name || !row.slug) {
                    errors.push(`Row ${i + 1}: Missing required fields (name, slug)`);
                    skipped++;
                    continue;
                }

                const productData: any = {
                    name: row.name,
                    slug: row.slug,
                    sku: row.sku || null,
                    description: row.description || null,
                    salePrice: row.salePrice ? parseFloat(row.salePrice) : null,
                    originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
                    stockOnHand: row.stockOnHand ? parseInt(row.stockOnHand) : 20,
                    enabled: row.enabled !== undefined ? row.enabled === 'true' || row.enabled === true : true,
                    condition: row.condition || 'NEW',
                    vat: row.vat ? parseFloat(row.vat) : 0,
                    vatInclusive: row.vatInclusive !== undefined ? row.vatInclusive === 'true' || row.vatInclusive === true : true,
                };

                // Resolve brand
                if (row.brandSlug && brandBySlug.has(row.brandSlug)) {
                    productData.brandId = brandBySlug.get(row.brandSlug);
                }

                // Check if product exists by slug
                const existing = await (db as any).query.products.findFirst({
                    where: eq(schema.products.slug as any, row.slug),
                });

                let productId: string;

                if (existing) {
                    // Update existing product
                    await db.update(schema.products as any)
                        .set({ ...productData, updatedAt: new Date() })
                        .where(eq(schema.products.id as any, existing.id));
                    productId = existing.id;
                    updated++;
                } else {
                    // Create new product
                    productId = uuidv4();
                    await db.insert(schema.products as any).values({ ...productData, id: productId });
                    created++;
                }
                touchedProductIds.add(productId);

                // Handle collections (pipe-separated slugs)
                if (row.collections) {
                    const collSlugs = String(row.collections).split('|').map((s: string) => s.trim()).filter(Boolean);
                    const collIds = collSlugs
                        .map((slug: string) => collectionBySlug.get(slug))
                        .filter((id): id is string => !!id);

                    if (collIds.length > 0) {
                        // Remove existing and re-add
                        await db.delete(schema.productCollections as any)
                            .where(eq(schema.productCollections.productId as any, productId));
                        await db.insert(schema.productCollections as any).values(
                            collIds.map((cid: string, idx: number) => ({
                                id: uuidv4(),
                                productId,
                                collectionId: cid,
                                sortOrder: idx,
                            }))
                        );
                    }
                }

            } catch (err: any) {
                errors.push(`Row ${i + 1} (${row.name || 'unknown'}): ${err.message}`);
                skipped++;
            }
        }

        await runSearchSyncSafely(
            { type: "search.sync", payload: { productIds: Array.from(touchedProductIds) } },
            `import:${touchedProductIds.size}`
        );

        await fastify.cache.invalidateTags(["products", "homepage-collections"]);

        return {
            success: true,
            created,
            updated,
            skipped,
            total: csvData.length,
            errors: errors.length > 0 ? errors : undefined,
        };
    });
};

export default productsAdminRoutes;

