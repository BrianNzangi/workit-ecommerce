import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema, products, productCollections, homepageCollectionProducts, productAssets } from '@workit/db';
import { eq, or, ilike, and } from 'drizzle-orm';
import type { ProductInput } from '@workit/validation';

@Injectable()
export class ProductService {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async createProduct(input: ProductInput) {
        const { collections, homepageCollections, assetIds, ...productData } = input;

        const existingProduct = await this.db.query.products.findFirst({
            where: eq(products.slug, input.slug),
        });

        if (existingProduct) {
            throw new ConflictException('Product with this slug already exists');
        }

        const [product] = await this.db.insert(products).values({
            name: productData.name,
            slug: productData.slug,
            description: productData.description,
            sku: productData.sku,
            salePrice: productData.salePrice,
            originalPrice: productData.originalPrice,
            stockOnHand: productData.stockOnHand ?? 0,
            enabled: productData.enabled,
            condition: productData.condition as any,
            brandId: productData.brandId,
            shippingMethodId: productData.shippingMethodId,
        } as any).returning();

        // Handle relations
        if (collections && collections.length > 0) {
            await this.db.insert(productCollections).values(
                collections.map(collectionId => ({
                    productId: product.id,
                    collectionId,
                }))
            ).execute();
        }

        if (homepageCollections && homepageCollections.length > 0) {
            await this.db.insert(homepageCollectionProducts).values(
                homepageCollections.map(collectionId => ({
                    productId: product.id,
                    collectionId,
                }))
            ).execute();
        }

        if (assetIds && assetIds.length > 0) {
            await this.db.insert(productAssets).values(
                assetIds.map((assetId, index) => ({
                    productId: product.id,
                    assetId,
                    sortOrder: index,
                }))
            ).execute();
        }

        return product;
    }

    async updateProduct(id: string, input: Partial<ProductInput>) {
        const { collections, homepageCollections, assetIds, ...productData } = input;

        const [product] = await this.db.update(products)
            .set({
                ...productData,
                updatedAt: new Date(),
            } as any)
            .where(eq(products.id, id))
            .returning();

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Sync collections
        if (collections !== undefined) {
            await this.db.delete(productCollections)
                .where(eq(productCollections.productId, id))
                .execute();

            if (collections.length > 0) {
                await this.db.insert(productCollections).values(
                    collections.map(collectionId => ({
                        productId: id,
                        collectionId,
                    }))
                ).execute();
            }
        }

        // Sync homepage collections
        if (homepageCollections !== undefined) {
            await this.db.delete(homepageCollectionProducts)
                .where(eq(homepageCollectionProducts.productId, id))
                .execute();

            if (homepageCollections.length > 0) {
                await this.db.insert(homepageCollectionProducts).values(
                    homepageCollections.map(collectionId => ({
                        productId: id,
                        collectionId,
                    }))
                ).execute();
            }
        }

        // Sync assets
        if (assetIds !== undefined) {
            await this.db.delete(productAssets)
                .where(eq(productAssets.productId, id))
                .execute();

            if (assetIds.length > 0) {
                await this.db.insert(productAssets).values(
                    assetIds.map((assetId, index) => ({
                        productId: id,
                        assetId,
                        sortOrder: index,
                    }))
                ).execute();
            }
        }

        return product;
    }

    async getProduct(id: string) {
        const product = await this.db.query.products.findFirst({
            where: eq(products.id, id),
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
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async getProducts(options: { limit?: number; offset?: number } = {}) {
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

    async searchProducts(query: string) {
        return this.db.query.products.findMany({
            where: or(
                ilike(products.name, `%${query}%`),
                ilike(products.description, `%${query}%`),
                ilike(products.sku, `%${query}%`),
            ),
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

    async deleteProduct(id: string) {
        const result = await this.db.delete(products)
            .where(eq(products.id, id))
            .returning();

        if (!result.length) {
            throw new NotFoundException('Product not found');
        }

        return result[0];
    }

    async importProducts(body: any) {
        // Parse CSV data from the request body
        const csvData = body.csvData || body.data || [];

        const results = {
            success: true,
            imported: 0,
            failed: 0,
            errors: [] as string[],
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
            } catch (error: any) {
                results.failed++;
                results.errors.push(`Row ${i + 1}: ${error.message}`);
            }
        }

        return results;
    }

    async exportProducts() {
        const allProducts = await this.db.query.products.findMany();

        // Convert to CSV format
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
                (product as any).condition || 'NEW',
                (product as any).brandId || '',
                (product as any).shippingMethodId || 'standard',
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        }).join('\n');

        return csvHeader + csvRows;
    }

    async getImportTemplate() {
        const template = `name,slug,description,sku,salePrice,originalPrice,stockOnHand,enabled,condition,brandId,shippingMethodId
"Example Product","example-product","This is an example product description","EX-001","99.99","149.99","20","true","NEW","","standard"`;

        return template;
    }
}
