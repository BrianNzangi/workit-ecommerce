"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const db_1 = require("@workit/db");
const drizzle_orm_1 = require("drizzle-orm");
let ProductService = class ProductService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createProduct(input) {
        const { collections, homepageCollections, assetIds, ...productData } = input;
        const existingProduct = await this.db.query.products.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.products.slug, input.slug),
        });
        if (existingProduct) {
            throw new common_1.ConflictException('Product with this slug already exists');
        }
        const [product] = await this.db.insert(db_1.products).values({
            name: productData.name,
            slug: productData.slug,
            description: productData.description,
            sku: productData.sku,
            salePrice: productData.salePrice,
            originalPrice: productData.originalPrice,
            stockOnHand: productData.stockOnHand ?? 0,
            enabled: productData.enabled,
            condition: productData.condition,
            brandId: productData.brandId,
            shippingMethodId: productData.shippingMethodId,
        }).returning();
        if (collections && collections.length > 0) {
            await this.db.insert(db_1.productCollections).values(collections.map(collectionId => ({
                productId: product.id,
                collectionId,
            }))).execute();
        }
        if (homepageCollections && homepageCollections.length > 0) {
            await this.db.insert(db_1.homepageCollectionProducts).values(homepageCollections.map(collectionId => ({
                productId: product.id,
                collectionId,
            }))).execute();
        }
        if (assetIds && assetIds.length > 0) {
            await this.db.insert(db_1.productAssets).values(assetIds.map((assetId, index) => ({
                productId: product.id,
                assetId,
                sortOrder: index,
            }))).execute();
        }
        return product;
    }
    async updateProduct(id, input) {
        const { collections, homepageCollections, assetIds, ...productData } = input;
        const [product] = await this.db.update(db_1.products)
            .set({
            ...productData,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(db_1.products.id, id))
            .returning();
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (collections !== undefined) {
            await this.db.delete(db_1.productCollections)
                .where((0, drizzle_orm_1.eq)(db_1.productCollections.productId, id))
                .execute();
            if (collections.length > 0) {
                await this.db.insert(db_1.productCollections).values(collections.map(collectionId => ({
                    productId: id,
                    collectionId,
                }))).execute();
            }
        }
        if (homepageCollections !== undefined) {
            await this.db.delete(db_1.homepageCollectionProducts)
                .where((0, drizzle_orm_1.eq)(db_1.homepageCollectionProducts.productId, id))
                .execute();
            if (homepageCollections.length > 0) {
                await this.db.insert(db_1.homepageCollectionProducts).values(homepageCollections.map(collectionId => ({
                    productId: id,
                    collectionId,
                }))).execute();
            }
        }
        if (assetIds !== undefined) {
            await this.db.delete(db_1.productAssets)
                .where((0, drizzle_orm_1.eq)(db_1.productAssets.productId, id))
                .execute();
            if (assetIds.length > 0) {
                await this.db.insert(db_1.productAssets).values(assetIds.map((assetId, index) => ({
                    productId: id,
                    assetId,
                    sortOrder: index,
                }))).execute();
            }
        }
        return product;
    }
    async getProduct(id) {
        const product = await this.db.query.products.findFirst({
            where: (0, drizzle_orm_1.eq)(db_1.products.id, id),
            with: {
                assets: {
                    with: {
                        asset: true,
                    }
                },
                collections: {
                    with: {
                        collection: true,
                    }
                },
                homepageCollections: {
                    with: {
                        collection: true,
                    }
                },
            }
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async getProducts(options = {}) {
        const { limit = 50, offset = 0 } = options;
        return this.db.query.products.findMany({
            limit,
            offset,
            orderBy: (products, { desc }) => [desc(products.createdAt)],
            with: {
                assets: {
                    with: {
                        asset: true,
                    }
                },
                collections: {
                    with: {
                        collection: true,
                    }
                },
                homepageCollections: {
                    with: {
                        collection: true,
                    }
                },
            },
        });
    }
    async searchProducts(query) {
        return this.db.query.products.findMany({
            where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(db_1.products.name, `%${query}%`), (0, drizzle_orm_1.ilike)(db_1.products.description, `%${query}%`), (0, drizzle_orm_1.ilike)(db_1.products.sku, `%${query}%`)),
            with: {
                assets: {
                    with: {
                        asset: true,
                    }
                },
                collections: {
                    with: {
                        collection: true,
                    }
                },
                homepageCollections: {
                    with: {
                        collection: true,
                    }
                },
            },
        });
    }
    async deleteProduct(id) {
        const result = await this.db.delete(db_1.products)
            .where((0, drizzle_orm_1.eq)(db_1.products.id, id))
            .returning();
        if (!result.length) {
            throw new common_1.NotFoundException('Product not found');
        }
        return result[0];
    }
    async importProducts(body) {
        const csvData = body.csvData || body.data || [];
        const results = {
            success: true,
            imported: 0,
            failed: 0,
            errors: [],
        };
        if (!Array.isArray(csvData) || csvData.length === 0) {
            return {
                ...results,
                success: false,
                errors: ['No data provided or invalid format'],
            };
        }
        for (let i = 0; i < csvData.length; i++) {
            const row = csvData[i];
            try {
                if (!row.name || !row.slug) {
                    continue;
                }
                await this.createProduct({
                    name: row.name,
                    slug: row.slug,
                    description: row.description || null,
                    sku: row.sku || null,
                    salePrice: row.salePrice ? parseFloat(row.salePrice) : undefined,
                    originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : undefined,
                    enabled: row.enabled === 'true' || row.enabled === true,
                    condition: row.condition || 'NEW',
                    brandId: row.brandId || null,
                    shippingMethodId: row.shippingMethodId || 'standard',
                    stockOnHand: row.stockOnHand ? parseInt(row.stockOnHand) : 0,
                });
                results.imported++;
            }
            catch (error) {
                results.failed++;
                results.errors.push(`Row ${i + 1}: ${error.message}`);
            }
        }
        return results;
    }
    async exportProducts() {
        const allProducts = await this.db.query.products.findMany();
        const csvHeader = 'name,slug,description,sku,salePrice,originalPrice,stockOnHand,enabled,condition,brandId,shippingMethodId\n';
        const csvRows = allProducts.map(product => {
            return [
                product.name,
                product.slug,
                product.description || '',
                product.sku || '',
                product.salePrice || '',
                product.originalPrice || '',
                product.stockOnHand || 0,
                product.enabled,
                product.condition || 'NEW',
                product.brandId || '',
                product.shippingMethodId || 'standard',
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        }).join('\n');
        return csvHeader + csvRows;
    }
    async getImportTemplate() {
        const template = `name,slug,description,sku,salePrice,originalPrice,stockOnHand,enabled,condition,brandId,shippingMethodId
"Example Product","example-product","This is an example product description","EX-001","99.99","149.99","20","true","NEW","","standard"`;
        return template;
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], ProductService);
//# sourceMappingURL=products.service.js.map