import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import { eq, and, like, or, sql, desc, inArray } from 'drizzle-orm';

@Injectable()
export class StoreService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    /**
     * Get all active collections with hierarchy
     */
    async getCollections(parentId?: string, featured?: boolean) {
        const whereConditions = [eq(schema.collections.enabled, true)];

        // If filtering by featured, get all collections (parent and children) that match
        if (featured !== undefined) {
            whereConditions.push(eq(schema.collections.showInMostShopped, featured));
        } else {
            // Normal hierarchy filtering
            if (parentId) {
                whereConditions.push(eq(schema.collections.parentId, parentId));
            } else {
                whereConditions.push(sql`${schema.collections.parentId} IS NULL`);
            }
        }

        const collections = await this.db
            .select({
                id: schema.collections.id,
                name: schema.collections.name,
                enabled: schema.collections.enabled,
                slug: schema.collections.slug,
                description: schema.collections.description,
                assetId: schema.collections.assetId,
                parentId: schema.collections.parentId,
                sortOrder: schema.collections.sortOrder,
                showInMostShopped: schema.collections.showInMostShopped,
                asset: {
                    id: schema.assets.id,
                    source: schema.assets.source,
                    preview: schema.assets.preview,
                }
            })
            .from(schema.collections)
            .leftJoin(schema.assets, eq(schema.collections.assetId, schema.assets.id))
            .where(and(...whereConditions))
            .orderBy(schema.collections.sortOrder);

        // Fetch children for each collection
        const enrichedCollections = await Promise.all(
            collections.map(async (collection) => {
                const children = await this.db
                    .select({
                        id: schema.collections.id,
                        name: schema.collections.name,
                        slug: schema.collections.slug,
                        enabled: schema.collections.enabled,
                        assetId: schema.collections.assetId,
                        showInMostShopped: schema.collections.showInMostShopped,
                        asset: {
                            id: schema.assets.id,
                            source: schema.assets.source,
                            preview: schema.assets.preview,
                        }
                    })
                    .from(schema.collections)
                    .leftJoin(schema.assets, eq(schema.collections.assetId, schema.assets.id))
                    .where(
                        and(
                            eq(schema.collections.parentId, collection.id),
                            eq(schema.collections.enabled, true)
                        )
                    )
                    .orderBy(schema.collections.sortOrder);

                return { ...collection, children };
            })
        );

        return enrichedCollections;
    }

    /**
     * Get published products with optional filters
     */
    async getProducts(filters?: {
        collectionId?: string;
        collection?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        limit?: number;
        offset?: number;
        page?: number;
    }) {
        const { collectionId, collection: collectionSlug, search, minPrice, maxPrice, limit = 12, offset, page = 1 } = filters || {};
        const calculatedOffset = offset !== undefined ? offset : (page - 1) * limit;

        const conditions = [eq(schema.products.enabled, true)];

        if (search) {
            conditions.push(
                or(
                    like(schema.products.name, `%${search}%`),
                    like(schema.products.description, `%${search}%`)
                )!
            );
        }

        // Handle collection filtering (including sub-collections)
        let targetCollectionIds: string[] = [];
        if (collectionId || collectionSlug) {
            let rootCollectionId = collectionId;

            if (!rootCollectionId && collectionSlug) {
                const [col] = await this.db
                    .select({ id: schema.collections.id })
                    .from(schema.collections)
                    .where(eq(schema.collections.slug, collectionSlug))
                    .limit(1);
                if (col) rootCollectionId = col.id;
            }

            if (rootCollectionId) {
                targetCollectionIds.push(rootCollectionId);
                // Recursively get all children IDs
                const getAllChildIds = async (parentId: string) => {
                    const children = await this.db
                        .select({ id: schema.collections.id })
                        .from(schema.collections)
                        .where(eq(schema.collections.parentId, parentId));
                    for (const child of children) {
                        targetCollectionIds.push(child.id);
                        await getAllChildIds(child.id);
                    }
                };
                await getAllChildIds(rootCollectionId);
            }
        }

        if (targetCollectionIds.length > 0) {
            const productIdsInCollections = (await this.db
                .select({ productId: schema.productCollections.productId })
                .from(schema.productCollections)
                .where(inArray(schema.productCollections.collectionId, targetCollectionIds)))
                .map(pc => pc.productId);

            if (productIdsInCollections.length > 0) {
                conditions.push(inArray(schema.products.id, productIdsInCollections));
            } else {
                // If no products in these collections, ensure we return nothing
                return {
                    data: {
                        products: [],
                        pagination: {
                            total: 0,
                            page,
                            limit,
                            totalPages: 0
                        }
                    }
                };
            }
        }

        // Get total count for pagination
        const [countResult] = await this.db
            .select({ count: sql<number>`count(*)` })
            .from(schema.products)
            .where(and(...conditions));

        const total = Number(countResult?.count || 0);

        let products = await this.db
            .select({
                id: schema.products.id,
                name: schema.products.name,
                slug: schema.products.slug,
                description: schema.products.description,
                salePrice: schema.products.salePrice,
                originalPrice: schema.products.originalPrice,
                stockOnHand: schema.products.stockOnHand,
                brandId: schema.products.brandId,
                createdAt: schema.products.createdAt,
            })
            .from(schema.products)
            .where(and(...conditions))
            .limit(limit)
            .offset(calculatedOffset)
            .orderBy(desc(schema.products.createdAt));

        // Enrich with featured image
        const enrichedProducts = await Promise.all(
            products.map(async (product) => {
                // Try to get featured image first
                let [featuredAsset] = await this.db
                    .select({
                        id: schema.assets.id,
                        source: schema.assets.source,
                        preview: schema.assets.preview,
                    })
                    .from(schema.productAssets)
                    .innerJoin(schema.assets, eq(schema.productAssets.assetId, schema.assets.id))
                    .where(
                        and(
                            eq(schema.productAssets.productId, product.id),
                            eq(schema.productAssets.featured, true)
                        )
                    )
                    .limit(1);

                // If no featured image, get the first image by sortOrder
                if (!featuredAsset) {
                    [featuredAsset] = await this.db
                        .select({
                            id: schema.assets.id,
                            source: schema.assets.source,
                            preview: schema.assets.preview,
                        })
                        .from(schema.productAssets)
                        .innerJoin(schema.assets, eq(schema.productAssets.assetId, schema.assets.id))
                        .where(eq(schema.productAssets.productId, product.id))
                        .orderBy(schema.productAssets.sortOrder)
                        .limit(1);
                }

                // Get brand
                let brand: any = null;
                if (product.brandId) {
                    [brand] = await this.db
                        .select()
                        .from(schema.brands)
                        .where(eq(schema.brands.id, product.brandId))
                        .limit(1);
                }

                return {
                    ...product,
                    featuredImage: featuredAsset?.source || null,
                    inStock: product.stockOnHand > 0,
                    brand
                };
            })
        );

        // Apply price filter (ideally this should be in SQL, but keeping consistency for now)
        let filteredProducts = enrichedProducts;
        if (minPrice !== undefined) {
            filteredProducts = filteredProducts.filter(p => (p.salePrice || 0) >= minPrice);
        }
        if (maxPrice !== undefined) {
            filteredProducts = filteredProducts.filter(p => (p.salePrice || 0) <= maxPrice);
        }

        return {
            data: {
                products: filteredProducts,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        };
    }

    /**
     * Get single product with all details
     */
    async getProduct(idOrSlug: string) {
        const [product] = await this.db
            .select()
            .from(schema.products)
            .where(
                and(
                    or(
                        eq(schema.products.id, idOrSlug),
                        eq(schema.products.slug, idOrSlug)
                    ),
                    eq(schema.products.enabled, true)
                )
            )
            .limit(1);

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const id = product.id;

        // Get all product images
        const images = await this.db
            .select({
                id: schema.assets.id,
                source: schema.assets.source,
                preview: schema.assets.preview,
                sortOrder: schema.productAssets.sortOrder,
                featured: schema.productAssets.featured,
            })
            .from(schema.productAssets)
            .innerJoin(schema.assets, eq(schema.productAssets.assetId, schema.assets.id))
            .where(eq(schema.productAssets.productId, id))
            .orderBy(schema.productAssets.sortOrder);

        // Get collections
        const productCollections = await this.db
            .select({
                id: schema.collections.id,
                name: schema.collections.name,
                slug: schema.collections.slug,
            })
            .from(schema.productCollections)
            .innerJoin(schema.collections, eq(schema.productCollections.collectionId, schema.collections.id))
            .where(eq(schema.productCollections.productId, id));

        // Get brand info
        let brand: any = null;
        if (product.brandId) {
            [brand] = await this.db
                .select({
                    id: schema.brands.id,
                    name: schema.brands.name,
                    slug: schema.brands.slug,
                })
                .from(schema.brands)
                .where(eq(schema.brands.id, product.brandId))
                .limit(1);
        }

        return {
            ...product,
            images,
            collections: productCollections,
            brand,
        };
    }

    /**
     * Search products by name or description
     */
    async searchProducts(query: string) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const searchTerm = `%${query.trim()}%`;

        const products = await this.db
            .select({
                id: schema.products.id,
                name: schema.products.name,
                slug: schema.products.slug,
                salePrice: schema.products.salePrice,
            })
            .from(schema.products)
            .where(
                and(
                    eq(schema.products.enabled, true),
                    or(
                        like(schema.products.name, searchTerm),
                        like(schema.products.description, searchTerm)
                    )
                )
            )
            .limit(10);

        // Get featured images
        const enrichedProducts = await Promise.all(
            products.map(async (product) => {
                // Try to get featured image first
                let [featuredAsset] = await this.db
                    .select({
                        source: schema.assets.source,
                    })
                    .from(schema.productAssets)
                    .innerJoin(schema.assets, eq(schema.productAssets.assetId, schema.assets.id))
                    .where(
                        and(
                            eq(schema.productAssets.productId, product.id),
                            eq(schema.productAssets.featured, true)
                        )
                    )
                    .limit(1);

                // If no featured image, get the first image by sortOrder
                if (!featuredAsset) {
                    [featuredAsset] = await this.db
                        .select({
                            source: schema.assets.source,
                        })
                        .from(schema.productAssets)
                        .innerJoin(schema.assets, eq(schema.productAssets.assetId, schema.assets.id))
                        .where(eq(schema.productAssets.productId, product.id))
                        .orderBy(schema.productAssets.sortOrder)
                        .limit(1);
                }

                return {
                    ...product,
                    featuredImage: featuredAsset?.source || null,
                };
            })
        );

        return enrichedProducts;
    }

    /**
     * Get active shipping methods
     */
    async getShippingMethods() {
        return await this.db
            .select()
            .from(schema.shippingMethods)
            .where(eq(schema.shippingMethods.enabled, true));
    }

    /**
     * Get shipping zones with cities
     */
    async getShippingZones() {
        const zones = await this.db
            .select()
            .from(schema.shippingZones);

        const enrichedZones = await Promise.all(
            zones.map(async (zone) => {
                const cities = await this.db
                    .select()
                    .from(schema.shippingCities)
                    .where(eq(schema.shippingCities.zoneId, zone.id));

                const [method] = await this.db
                    .select()
                    .from(schema.shippingMethods)
                    .where(eq(schema.shippingMethods.id, zone.shippingMethodId))
                    .limit(1);

                return {
                    ...zone,
                    cities,
                    method,
                };
            })
        );

        return enrichedZones;
    }

    /**
     * Get active banners
     */
    async getBanners() {
        const banners = await this.db
            .select()
            .from(schema.banners)
            .where(eq(schema.banners.enabled, true))
            .orderBy(schema.banners.sortOrder);

        // Enrich with images and collection
        const enrichedBanners = await Promise.all(
            banners.map(async (banner) => {
                let desktopImage: any = null;
                let mobileImage: any = null;
                let collection: any = null;

                if (banner.desktopImageId) {
                    [desktopImage] = await this.db
                        .select()
                        .from(schema.assets)
                        .where(eq(schema.assets.id, banner.desktopImageId))
                        .limit(1);
                }

                if (banner.mobileImageId) {
                    [mobileImage] = await this.db
                        .select()
                        .from(schema.assets)
                        .where(eq(schema.assets.id, banner.mobileImageId))
                        .limit(1);
                }

                if (banner.collectionId) {
                    [collection] = await this.db
                        .select({
                            id: schema.collections.id,
                            name: schema.collections.name,
                            slug: schema.collections.slug,
                        })
                        .from(schema.collections)
                        .where(eq(schema.collections.id, banner.collectionId))
                        .limit(1);
                }

                return {
                    ...banner,
                    desktopImage,
                    mobileImage,
                    collection,
                };
            })
        );

        return enrichedBanners;
    }

    /**
     * Get homepage collections
     */
    async getHomepageCollections() {
        const collections = await this.db
            .select()
            .from(schema.homepageCollections)
            .where(eq(schema.homepageCollections.enabled, true))
            .orderBy(schema.homepageCollections.sortOrder);

        // Enrich with products
        const enrichedCollections = await Promise.all(
            collections.map(async (collection) => {
                const products = await this.db
                    .select({
                        id: schema.products.id,
                        name: schema.products.name,
                        slug: schema.products.slug,
                        description: schema.products.description,
                        salePrice: schema.products.salePrice,
                        originalPrice: schema.products.originalPrice,
                        stockOnHand: schema.products.stockOnHand,
                        brandId: schema.products.brandId,
                    })
                    .from(schema.homepageCollectionProducts)
                    .innerJoin(schema.products, eq(schema.homepageCollectionProducts.productId, schema.products.id))
                    .where(eq(schema.homepageCollectionProducts.collectionId, collection.id))
                    .orderBy(schema.homepageCollectionProducts.sortOrder);

                // Enrich each product with featured image
                const enrichedProducts = await Promise.all(
                    products.map(async (product) => {
                        // Try to get featured image first
                        let [featuredAsset] = await this.db
                            .select({
                                id: schema.assets.id,
                                source: schema.assets.source,
                                preview: schema.assets.preview,
                            })
                            .from(schema.productAssets)
                            .innerJoin(schema.assets, eq(schema.productAssets.assetId, schema.assets.id))
                            .where(
                                and(
                                    eq(schema.productAssets.productId, product.id),
                                    eq(schema.productAssets.featured, true)
                                )
                            )
                            .limit(1);

                        // If no featured image, get the first image by sortOrder
                        if (!featuredAsset) {
                            [featuredAsset] = await this.db
                                .select({
                                    id: schema.assets.id,
                                    source: schema.assets.source,
                                    preview: schema.assets.preview,
                                })
                                .from(schema.productAssets)
                                .innerJoin(schema.assets, eq(schema.productAssets.assetId, schema.assets.id))
                                .where(eq(schema.productAssets.productId, product.id))
                                .orderBy(schema.productAssets.sortOrder)
                                .limit(1);
                        }

                        return {
                            ...product,
                            featuredImage: featuredAsset?.source || null,
                            inStock: product.stockOnHand > 0,
                        };
                    })
                );

                return {
                    ...collection,
                    products: enrichedProducts,
                };
            })
        );

        return enrichedCollections;
    }

    /**
     * Get active campaigns
     */
    async getCampaigns() {
        return await this.db
            .select()
            .from(schema.campaigns)
            .where(eq(schema.campaigns.status, 'ACTIVE'))
            .orderBy(desc(schema.campaigns.createdAt));
    }

    /**
     * Get store policies
     */
    async getPolicies() {
        const settings = await this.db
            .select()
            .from(schema.settings)
            .where(like(schema.settings.key, 'policies.%'));

        const policies: any = {};
        settings.forEach(setting => {
            const key = setting.key.replace('policies.', '');
            policies[key] = setting.value;
        });

        return policies;
    }

    /**
     * Validate cart items
     */
    async validateCart(items: any[]) {
        const results: any[] = [];
        let allValid = true;

        for (const item of items) {
            const productId = item.productId || item.id;
            const [product] = await this.db
                .select()
                .from(schema.products)
                .where(eq(schema.products.id, productId))
                .limit(1);

            if (!product) {
                results.push({
                    productId,
                    valid: false,
                    reason: 'Product not found',
                    item
                });
                allValid = false;
                continue;
            }

            if (!product.enabled) {
                results.push({
                    productId,
                    valid: false,
                    reason: 'Product is no longer available',
                    item
                });
                allValid = false;
                continue;
            }

            if (product.stockOnHand < item.quantity) {
                results.push({
                    productId,
                    valid: false,
                    reason: `Insufficient stock. Available: ${product.stockOnHand}`,
                    item
                });
                allValid = false;
                continue;
            }

            results.push({
                productId,
                valid: true,
                item
            });
        }

        return {
            valid: allValid,
            results,
            invalidItems: results.filter(r => !r.valid)
        };
    }
}
