"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("@workit/db"));
const drizzle_orm_1 = require("drizzle-orm");
let StoreService = class StoreService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getCollections(parentId, featured) {
        const whereConditions = [(0, drizzle_orm_1.eq)(schema.collections.enabled, true)];
        if (featured !== undefined) {
            whereConditions.push((0, drizzle_orm_1.eq)(schema.collections.showInMostShopped, featured));
        }
        else {
            if (parentId) {
                whereConditions.push((0, drizzle_orm_1.eq)(schema.collections.parentId, parentId));
            }
            else {
                whereConditions.push((0, drizzle_orm_1.sql) `${schema.collections.parentId} IS NULL`);
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
            .leftJoin(schema.assets, (0, drizzle_orm_1.eq)(schema.collections.assetId, schema.assets.id))
            .where((0, drizzle_orm_1.and)(...whereConditions))
            .orderBy(schema.collections.sortOrder);
        const enrichedCollections = await Promise.all(collections.map(async (collection) => {
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
                .leftJoin(schema.assets, (0, drizzle_orm_1.eq)(schema.collections.assetId, schema.assets.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.collections.parentId, collection.id), (0, drizzle_orm_1.eq)(schema.collections.enabled, true)))
                .orderBy(schema.collections.sortOrder);
            return { ...collection, children };
        }));
        return enrichedCollections;
    }
    async getProducts(filters) {
        const { collectionId, collection: collectionSlug, search, minPrice, maxPrice, limit = 12, offset, page = 1 } = filters || {};
        const calculatedOffset = offset !== undefined ? offset : (page - 1) * limit;
        const conditions = [(0, drizzle_orm_1.eq)(schema.products.enabled, true)];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema.products.name, `%${search}%`), (0, drizzle_orm_1.like)(schema.products.description, `%${search}%`)));
        }
        let targetCollectionIds = [];
        if (collectionId || collectionSlug) {
            let rootCollectionId = collectionId;
            if (!rootCollectionId && collectionSlug) {
                const [col] = await this.db
                    .select({ id: schema.collections.id })
                    .from(schema.collections)
                    .where((0, drizzle_orm_1.eq)(schema.collections.slug, collectionSlug))
                    .limit(1);
                if (col)
                    rootCollectionId = col.id;
            }
            if (rootCollectionId) {
                targetCollectionIds.push(rootCollectionId);
                const getAllChildIds = async (parentId) => {
                    const children = await this.db
                        .select({ id: schema.collections.id })
                        .from(schema.collections)
                        .where((0, drizzle_orm_1.eq)(schema.collections.parentId, parentId));
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
                .where((0, drizzle_orm_1.inArray)(schema.productCollections.collectionId, targetCollectionIds)))
                .map(pc => pc.productId);
            if (productIdsInCollections.length > 0) {
                conditions.push((0, drizzle_orm_1.inArray)(schema.products.id, productIdsInCollections));
            }
            else {
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
        const [countResult] = await this.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema.products)
            .where((0, drizzle_orm_1.and)(...conditions));
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
            .where((0, drizzle_orm_1.and)(...conditions))
            .limit(limit)
            .offset(calculatedOffset)
            .orderBy((0, drizzle_orm_1.desc)(schema.products.createdAt));
        const enrichedProducts = await Promise.all(products.map(async (product) => {
            let [featuredAsset] = await this.db
                .select({
                id: schema.assets.id,
                source: schema.assets.source,
                preview: schema.assets.preview,
            })
                .from(schema.productAssets)
                .innerJoin(schema.assets, (0, drizzle_orm_1.eq)(schema.productAssets.assetId, schema.assets.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.productAssets.productId, product.id), (0, drizzle_orm_1.eq)(schema.productAssets.featured, true)))
                .limit(1);
            if (!featuredAsset) {
                [featuredAsset] = await this.db
                    .select({
                    id: schema.assets.id,
                    source: schema.assets.source,
                    preview: schema.assets.preview,
                })
                    .from(schema.productAssets)
                    .innerJoin(schema.assets, (0, drizzle_orm_1.eq)(schema.productAssets.assetId, schema.assets.id))
                    .where((0, drizzle_orm_1.eq)(schema.productAssets.productId, product.id))
                    .orderBy(schema.productAssets.sortOrder)
                    .limit(1);
            }
            let brand = null;
            if (product.brandId) {
                [brand] = await this.db
                    .select()
                    .from(schema.brands)
                    .where((0, drizzle_orm_1.eq)(schema.brands.id, product.brandId))
                    .limit(1);
            }
            return {
                ...product,
                featuredImage: featuredAsset?.source || null,
                inStock: product.stockOnHand > 0,
                brand
            };
        }));
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
    async getProduct(idOrSlug) {
        const [product] = await this.db
            .select()
            .from(schema.products)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema.products.id, idOrSlug), (0, drizzle_orm_1.eq)(schema.products.slug, idOrSlug)), (0, drizzle_orm_1.eq)(schema.products.enabled, true)))
            .limit(1);
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const id = product.id;
        const images = await this.db
            .select({
            id: schema.assets.id,
            source: schema.assets.source,
            preview: schema.assets.preview,
            sortOrder: schema.productAssets.sortOrder,
            featured: schema.productAssets.featured,
        })
            .from(schema.productAssets)
            .innerJoin(schema.assets, (0, drizzle_orm_1.eq)(schema.productAssets.assetId, schema.assets.id))
            .where((0, drizzle_orm_1.eq)(schema.productAssets.productId, id))
            .orderBy(schema.productAssets.sortOrder);
        const productCollections = await this.db
            .select({
            id: schema.collections.id,
            name: schema.collections.name,
            slug: schema.collections.slug,
        })
            .from(schema.productCollections)
            .innerJoin(schema.collections, (0, drizzle_orm_1.eq)(schema.productCollections.collectionId, schema.collections.id))
            .where((0, drizzle_orm_1.eq)(schema.productCollections.productId, id));
        let brand = null;
        if (product.brandId) {
            [brand] = await this.db
                .select({
                id: schema.brands.id,
                name: schema.brands.name,
                slug: schema.brands.slug,
            })
                .from(schema.brands)
                .where((0, drizzle_orm_1.eq)(schema.brands.id, product.brandId))
                .limit(1);
        }
        return {
            ...product,
            images,
            collections: productCollections,
            brand,
        };
    }
    async searchProducts(query) {
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
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.products.enabled, true), (0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema.products.name, searchTerm), (0, drizzle_orm_1.like)(schema.products.description, searchTerm))))
            .limit(10);
        const enrichedProducts = await Promise.all(products.map(async (product) => {
            let [featuredAsset] = await this.db
                .select({
                source: schema.assets.source,
            })
                .from(schema.productAssets)
                .innerJoin(schema.assets, (0, drizzle_orm_1.eq)(schema.productAssets.assetId, schema.assets.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.productAssets.productId, product.id), (0, drizzle_orm_1.eq)(schema.productAssets.featured, true)))
                .limit(1);
            if (!featuredAsset) {
                [featuredAsset] = await this.db
                    .select({
                    source: schema.assets.source,
                })
                    .from(schema.productAssets)
                    .innerJoin(schema.assets, (0, drizzle_orm_1.eq)(schema.productAssets.assetId, schema.assets.id))
                    .where((0, drizzle_orm_1.eq)(schema.productAssets.productId, product.id))
                    .orderBy(schema.productAssets.sortOrder)
                    .limit(1);
            }
            return {
                ...product,
                featuredImage: featuredAsset?.source || null,
            };
        }));
        return enrichedProducts;
    }
    async getShippingMethods() {
        return await this.db
            .select()
            .from(schema.shippingMethods)
            .where((0, drizzle_orm_1.eq)(schema.shippingMethods.enabled, true));
    }
    async getShippingZones() {
        const zones = await this.db
            .select()
            .from(schema.shippingZones);
        const enrichedZones = await Promise.all(zones.map(async (zone) => {
            const cities = await this.db
                .select()
                .from(schema.shippingCities)
                .where((0, drizzle_orm_1.eq)(schema.shippingCities.zoneId, zone.id));
            const [method] = await this.db
                .select()
                .from(schema.shippingMethods)
                .where((0, drizzle_orm_1.eq)(schema.shippingMethods.id, zone.shippingMethodId))
                .limit(1);
            return {
                ...zone,
                cities,
                method,
            };
        }));
        return enrichedZones;
    }
    async getBanners() {
        const banners = await this.db
            .select()
            .from(schema.banners)
            .where((0, drizzle_orm_1.eq)(schema.banners.enabled, true))
            .orderBy(schema.banners.sortOrder);
        const enrichedBanners = await Promise.all(banners.map(async (banner) => {
            let desktopImage = null;
            let mobileImage = null;
            let collection = null;
            if (banner.desktopImageId) {
                [desktopImage] = await this.db
                    .select()
                    .from(schema.assets)
                    .where((0, drizzle_orm_1.eq)(schema.assets.id, banner.desktopImageId))
                    .limit(1);
            }
            if (banner.mobileImageId) {
                [mobileImage] = await this.db
                    .select()
                    .from(schema.assets)
                    .where((0, drizzle_orm_1.eq)(schema.assets.id, banner.mobileImageId))
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
                    .where((0, drizzle_orm_1.eq)(schema.collections.id, banner.collectionId))
                    .limit(1);
            }
            return {
                ...banner,
                desktopImage,
                mobileImage,
                collection,
            };
        }));
        return enrichedBanners;
    }
    async getHomepageCollections() {
        const collections = await this.db
            .select()
            .from(schema.homepageCollections)
            .where((0, drizzle_orm_1.eq)(schema.homepageCollections.enabled, true))
            .orderBy(schema.homepageCollections.sortOrder);
        const enrichedCollections = await Promise.all(collections.map(async (collection) => {
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
                .innerJoin(schema.products, (0, drizzle_orm_1.eq)(schema.homepageCollectionProducts.productId, schema.products.id))
                .where((0, drizzle_orm_1.eq)(schema.homepageCollectionProducts.collectionId, collection.id))
                .orderBy(schema.homepageCollectionProducts.sortOrder);
            const enrichedProducts = await Promise.all(products.map(async (product) => {
                let [featuredAsset] = await this.db
                    .select({
                    id: schema.assets.id,
                    source: schema.assets.source,
                    preview: schema.assets.preview,
                })
                    .from(schema.productAssets)
                    .innerJoin(schema.assets, (0, drizzle_orm_1.eq)(schema.productAssets.assetId, schema.assets.id))
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.productAssets.productId, product.id), (0, drizzle_orm_1.eq)(schema.productAssets.featured, true)))
                    .limit(1);
                if (!featuredAsset) {
                    [featuredAsset] = await this.db
                        .select({
                        id: schema.assets.id,
                        source: schema.assets.source,
                        preview: schema.assets.preview,
                    })
                        .from(schema.productAssets)
                        .innerJoin(schema.assets, (0, drizzle_orm_1.eq)(schema.productAssets.assetId, schema.assets.id))
                        .where((0, drizzle_orm_1.eq)(schema.productAssets.productId, product.id))
                        .orderBy(schema.productAssets.sortOrder)
                        .limit(1);
                }
                return {
                    ...product,
                    featuredImage: featuredAsset?.source || null,
                    inStock: product.stockOnHand > 0,
                };
            }));
            return {
                ...collection,
                products: enrichedProducts,
            };
        }));
        return enrichedCollections;
    }
    async getCampaigns() {
        return await this.db
            .select()
            .from(schema.campaigns)
            .where((0, drizzle_orm_1.eq)(schema.campaigns.status, 'ACTIVE'))
            .orderBy((0, drizzle_orm_1.desc)(schema.campaigns.createdAt));
    }
    async getPolicies() {
        const settings = await this.db
            .select()
            .from(schema.settings)
            .where((0, drizzle_orm_1.like)(schema.settings.key, 'policies.%'));
        const policies = {};
        settings.forEach(setting => {
            const key = setting.key.replace('policies.', '');
            policies[key] = setting.value;
        });
        return policies;
    }
    async validateCart(items) {
        const results = [];
        let allValid = true;
        for (const item of items) {
            const productId = item.productId || item.id;
            const [product] = await this.db
                .select()
                .from(schema.products)
                .where((0, drizzle_orm_1.eq)(schema.products.id, productId))
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
};
exports.StoreService = StoreService;
exports.StoreService = StoreService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], StoreService);
//# sourceMappingURL=store.service.js.map