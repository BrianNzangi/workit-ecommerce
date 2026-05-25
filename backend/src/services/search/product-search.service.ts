import { and, asc, db, eq, ilike, inArray, or, schema } from "../../lib/db.js";
import {
    deleteTypesenseProductRecords,
    isTypesenseEnabled,
    searchTypesenseProductIds,
    upsertTypesenseProductRecords,
} from "./typesense.client.js";
import { mapProductToSearchRecord } from "./product-search.mapper.js";
import { enrichProductCampaigns, enrichProductsWithCampaigns } from "../../lib/product-campaigns.js";

function uniqueIds(ids: string[]): string[] {
    return Array.from(new Set(ids.filter(Boolean)));
}

function orderByIds<T extends { id: string }>(ids: string[], products: T[]): T[] {
    const map = new Map(products.map((product) => [product.id, product]));
    return ids
        .map((id) => map.get(id))
        .filter((product): product is T => Boolean(product));
}

function serializeStoreProductListItem(product: any) {
    const firstAsset = Array.isArray(product?.assets)
        ? product.assets.find((asset: any) => asset?.featured) || product.assets[0]
        : null;
    const imageUrl = firstAsset?.asset?.preview || firstAsset?.asset?.source || null;
    const stockOnHand = product.stockOnHand ?? 0;

    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        salePrice: product.salePrice ?? null,
        originalPrice: product.originalPrice ?? null,
        stockOnHand,
        condition: product.condition ?? null,
        createdAt: product.createdAt ?? null,
        updatedAt: product.updatedAt ?? null,
        canBuy: stockOnHand > 0,
        brand: product.brand
            ? {
                id: product.brand.id,
                name: product.brand.name,
                slug: product.brand.slug,
            }
            : null,
        image: imageUrl,
        images: imageUrl
            ? [{
                id: firstAsset?.asset?.id || firstAsset?.id || product.id,
                url: imageUrl,
                featured: Boolean(firstAsset?.featured),
            }]
            : [],
        shippingMethod: product.shippingMethod
            ? {
                id: product.shippingMethod.id,
                code: product.shippingMethod.code,
                name: product.shippingMethod.name,
                description: product.shippingMethod.description ?? undefined,
                isExpress: Boolean(product.shippingMethod.isExpress),
            }
            : null,
        campaigns: product.campaigns || [],
        activePromotion: product.activePromotion || null,
        campaignTypes: product.campaignTypes || [],
        campaignType: product.campaignType || null,
        discountTypes: product.discountTypes || [],
        discountType: product.discountType || null,
    };
}


export class ProductSearchService {
    async searchStoreProducts(query: string, limit = 20): Promise<any[]> {
        const searchTerm = query.trim();
        if (!searchTerm) return [];

        if (isTypesenseEnabled()) {
            try {
                const productIds = await searchTypesenseProductIds(searchTerm, {
                    limit,
                    filters: "enabled:=true",
                });
                return this.findStoreProductsByIds(productIds);
            } catch (error) {
                console.error("Typesense store search failed, falling back to DB search", error);
            }
        }

        return this.fallbackStoreSearch(searchTerm, limit);
    }

    async searchAdminProducts(query: string, limit = 50): Promise<any[]> {
        const searchTerm = query.trim();
        if (!searchTerm) return [];

        if (isTypesenseEnabled()) {
            try {
                const productIds = await searchTypesenseProductIds(searchTerm, { limit });
                return this.findAdminProductsByIds(productIds);
            } catch (error) {
                console.error("Typesense admin search failed, falling back to DB search", error);
            }
        }

        return this.fallbackAdminSearch(searchTerm, limit);
    }

    async syncProductById(productId: string): Promise<void> {
        if (!isTypesenseEnabled()) return;

        const product = await db.query.products.findFirst({
            where: eq(schema.products.id, productId),
            with: {
                assets: { with: { asset: true } },
                collections: { with: { collection: true } },
                brand: true,
            },
        });

        if (!product) {
            await deleteTypesenseProductRecords([productId]);
            return;
        }

        await upsertTypesenseProductRecords([mapProductToSearchRecord(product)]);
    }

    async syncProductsByIds(productIds: string[]): Promise<void> {
        if (!isTypesenseEnabled()) return;

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
            await upsertTypesenseProductRecords(products.map(mapProductToSearchRecord));
        }

        const foundIds = new Set(products.map((product: any) => product.id));
        const missingIds = ids.filter((id) => !foundIds.has(id));
        if (missingIds.length > 0) {
            await deleteTypesenseProductRecords(missingIds);
        }
    }

    async deleteProductById(productId: string): Promise<void> {
        if (!isTypesenseEnabled()) return;
        await deleteTypesenseProductRecords([productId]);
    }

    async deleteProductsByIds(productIds: string[]): Promise<void> {
        if (!isTypesenseEnabled()) return;
        await deleteTypesenseProductRecords(uniqueIds(productIds));
    }

    async reindexAllProducts(batchSize = 200): Promise<{ indexed: number }> {
        if (!isTypesenseEnabled()) {
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

            await upsertTypesenseProductRecords(products.map(mapProductToSearchRecord));
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
            columns: {
                id: true,
                name: true,
                slug: true,
                salePrice: true,
                originalPrice: true,
                stockOnHand: true,
                condition: true,
                createdAt: true,
                updatedAt: true,
            },
            with: {
                assets: {
                    columns: {
                        id: true,
                        productId: true,
                        assetId: true,
                        sortOrder: true,
                        featured: true,
                    },
                    with: {
                        asset: {
                            columns: {
                                id: true,
                                name: true,
                                source: true,
                                preview: true,
                            },
                        },
                    },
                },
                brand: {
                    columns: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                shippingMethod: {
                    columns: {
                        id: true,
                        code: true,
                        name: true,
                        description: true,
                        isExpress: true,
                    },
                },
                campaignProducts: {
                    columns: {
                        id: true,
                        campaignId: true,
                        productId: true,
                        sortOrder: true,
                    },
                    with: {
                        campaign: {
                            columns: {
                                id: true,
                                name: true,
                                slug: true,
                                type: true,
                                status: true,
                                startDate: true,
                                endDate: true,
                                discountType: true,
                                discountValue: true,
                                couponCode: true,
                                minPurchaseAmount: true,
                                maxDiscountAmount: true,
                                usageLimit: true,
                                usagePerCustomer: true,
                            },
                        },
                    },
                },
            },
        });
        return enrichProductsWithCampaigns(results, { onlyActive: true }).map(serializeStoreProductListItem);
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
        return enrichProductsWithCampaigns(results);
    }

    private async findStoreProductsByIds(productIds: string[]): Promise<any[]> {
        if (productIds.length === 0) return [];

        const products = await db.query.products.findMany({
            where: and(
                eq(schema.products.enabled, true),
                inArray(schema.products.id, productIds)
            ),
            columns: {
                id: true,
                name: true,
                slug: true,
                salePrice: true,
                originalPrice: true,
                stockOnHand: true,
                condition: true,
                createdAt: true,
                updatedAt: true,
            },
            with: {
                assets: {
                    columns: {
                        id: true,
                        productId: true,
                        assetId: true,
                        sortOrder: true,
                        featured: true,
                    },
                    with: {
                        asset: {
                            columns: {
                                id: true,
                                name: true,
                                source: true,
                                preview: true,
                            },
                        },
                    },
                },
                brand: {
                    columns: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                shippingMethod: {
                    columns: {
                        id: true,
                        code: true,
                        name: true,
                        description: true,
                        isExpress: true,
                    },
                },
                campaignProducts: {
                    columns: {
                        id: true,
                        campaignId: true,
                        productId: true,
                        sortOrder: true,
                    },
                    with: {
                        campaign: {
                            columns: {
                                id: true,
                                name: true,
                                slug: true,
                                type: true,
                                status: true,
                                startDate: true,
                                endDate: true,
                                discountType: true,
                                discountValue: true,
                                couponCode: true,
                                minPurchaseAmount: true,
                                maxDiscountAmount: true,
                                usageLimit: true,
                                usagePerCustomer: true,
                            },
                        },
                    },
                },
            },
        });
        return enrichProductsWithCampaigns(orderByIds(productIds, products), { onlyActive: true })
            .map(serializeStoreProductListItem);
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
        return enrichProductsWithCampaigns(orderByIds(productIds, products));
    }
}

export const productSearchService = new ProductSearchService();
