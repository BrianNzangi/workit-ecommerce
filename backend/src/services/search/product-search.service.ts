import { and, asc, db, eq, ilike, inArray, or, schema } from "../../lib/db.js";
import {
    deleteAlgoliaProductRecords,
    isAlgoliaEnabled,
    searchAlgoliaProductIds,
    upsertAlgoliaProductRecords,
} from "./algolia.client.js";
import { mapProductToSearchRecord } from "./product-search.mapper.js";

function uniqueIds(ids: string[]): string[] {
    return Array.from(new Set(ids.filter(Boolean)));
}

function orderByIds<T extends { id: string }>(ids: string[], products: T[]): T[] {
    const map = new Map(products.map((product) => [product.id, product]));
    return ids
        .map((id) => map.get(id))
        .filter((product): product is T => Boolean(product));
}

function normalizeCampaignDate(value: unknown): Date | null {
    if (!value) return null;
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function enrichProductCampaigns(product: any, storeOnlyActive = false) {
    const now = new Date();
    const campaignRows = Array.isArray(product?.campaignProducts) ? product.campaignProducts : [];
    const campaigns = campaignRows
        .map((row: any) => row?.campaign)
        .filter(Boolean)
        .filter((campaign: any) => {
            if (!storeOnlyActive) return true;
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
}

function enrichProductsCampaigns(products: any[], storeOnlyActive = false) {
    return products.map((product: any) => enrichProductCampaigns(product, storeOnlyActive));
}

export class ProductSearchService {
    async searchStoreProducts(query: string, limit = 20): Promise<any[]> {
        const searchTerm = query.trim();
        if (!searchTerm) return [];

        if (isAlgoliaEnabled()) {
            try {
                const productIds = await searchAlgoliaProductIds(searchTerm, {
                    limit,
                    filters: "enabled:true",
                });
                return this.findStoreProductsByIds(productIds);
            } catch (error) {
                console.error("Algolia store search failed, falling back to DB search", error);
            }
        }

        return this.fallbackStoreSearch(searchTerm, limit);
    }

    async searchAdminProducts(query: string, limit = 50): Promise<any[]> {
        const searchTerm = query.trim();
        if (!searchTerm) return [];

        if (isAlgoliaEnabled()) {
            try {
                const productIds = await searchAlgoliaProductIds(searchTerm, { limit });
                return this.findAdminProductsByIds(productIds);
            } catch (error) {
                console.error("Algolia admin search failed, falling back to DB search", error);
            }
        }

        return this.fallbackAdminSearch(searchTerm, limit);
    }

    async syncProductById(productId: string): Promise<void> {
        if (!isAlgoliaEnabled()) return;

        const product = await db.query.products.findFirst({
            where: eq(schema.products.id, productId),
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                brand: true,
            },
        });

        if (!product) {
            await deleteAlgoliaProductRecords([productId]);
            return;
        }

        await upsertAlgoliaProductRecords([mapProductToSearchRecord(product)]);
    }

    async syncProductsByIds(productIds: string[]): Promise<void> {
        if (!isAlgoliaEnabled()) return;

        const ids = uniqueIds(productIds);
        if (ids.length === 0) return;

        const products = await db.query.products.findMany({
            where: inArray(schema.products.id, ids),
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                brand: true,
            },
        });

        if (products.length > 0) {
            await upsertAlgoliaProductRecords(products.map(mapProductToSearchRecord));
        }

        const foundIds = new Set(products.map((product: any) => product.id));
        const missingIds = ids.filter((id) => !foundIds.has(id));
        if (missingIds.length > 0) {
            await deleteAlgoliaProductRecords(missingIds);
        }
    }

    async deleteProductById(productId: string): Promise<void> {
        if (!isAlgoliaEnabled()) return;
        await deleteAlgoliaProductRecords([productId]);
    }

    async deleteProductsByIds(productIds: string[]): Promise<void> {
        if (!isAlgoliaEnabled()) return;
        await deleteAlgoliaProductRecords(uniqueIds(productIds));
    }

    async reindexAllProducts(batchSize = 200): Promise<{ indexed: number }> {
        if (!isAlgoliaEnabled()) {
            return { indexed: 0 };
        }

        let offset = 0;
        let indexed = 0;

        while (true) {
            const products = await db.query.products.findMany({
                limit: batchSize,
                offset,
                orderBy: [asc(schema.products.createdAt)],
                with: {
                    assets: { with: { asset: true } },
                    collections: { with: { collection: true } },
                    brand: true,
                },
            });

            if (products.length === 0) {
                break;
            }

            await upsertAlgoliaProductRecords(products.map(mapProductToSearchRecord));
            indexed += products.length;
            offset += batchSize;
        }

        return { indexed };
    }

    private async fallbackStoreSearch(searchTerm: string, limit: number): Promise<any[]> {
        const results = await db.query.products.findMany({
            where: and(
                eq(schema.products.enabled, true),
                or(
                    ilike(schema.products.name, `%${searchTerm}%`),
                    ilike(schema.products.description, `%${searchTerm}%`)
                )!
            ),
            limit,
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                brand: true,
                campaignProducts: { with: { campaign: true } },
            },
        });
        return enrichProductsCampaigns(results, true);
    }

    private async fallbackAdminSearch(searchTerm: string, limit: number): Promise<any[]> {
        const results = await (db as any).query.products.findMany({
            where: or(
                ilike(schema.products.name as any, `%${searchTerm}%`),
                ilike(schema.products.sku as any, `%${searchTerm}%`)
            ),
            limit,
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                homepageCollections: { with: { collection: true } },
                brand: true,
                campaignProducts: { with: { campaign: true } },
            },
        });
        return enrichProductsCampaigns(results);
    }

    private async findStoreProductsByIds(productIds: string[]): Promise<any[]> {
        if (productIds.length === 0) return [];

        const products = await db.query.products.findMany({
            where: and(
                eq(schema.products.enabled, true),
                inArray(schema.products.id, productIds)
            ),
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                brand: true,
                campaignProducts: { with: { campaign: true } },
            },
        });
        return enrichProductsCampaigns(orderByIds(productIds, products), true);
    }

    private async findAdminProductsByIds(productIds: string[]): Promise<any[]> {
        if (productIds.length === 0) return [];

        const products = await (db as any).query.products.findMany({
            where: inArray(schema.products.id as any, productIds),
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                homepageCollections: { with: { collection: true } },
                brand: true,
                campaignProducts: { with: { campaign: true } },
            },
        });
        return enrichProductsCampaigns(orderByIds(productIds, products));
    }
}

export const productSearchService = new ProductSearchService();
