import { BaseService } from '../base/base.service';
import { Product, CreateProductInput, ProductListOptions, ProductListResponse } from './product.types';

export class ProductService extends BaseService {
    /**
     * Create a new product
     */
    async createProduct(input: CreateProductInput): Promise<Product> {
        return this.adminClient.products.create(input);
    }

    /**
     * Update an existing product
     */
    async updateProduct(id: string, input: Partial<CreateProductInput>): Promise<Product> {
        return this.adminClient.products.update(id, input);
    }

    /**
     * Delete a product
     */
    async deleteProduct(id: string): Promise<boolean> {
        await this.adminClient.products.remove(id);
        return true;
    }

    /**
     * Get a single product by ID
     */
    async getProduct(id: string): Promise<Product | null> {
        try {
            return await this.adminClient.products.get(id);
        } catch (error: any) {
            if (error.statusCode === 404) return null;
            throw error;
        }
    }

    /**
     * Get a list of products
     */
    async getProducts(options: ProductListOptions = {}): Promise<Product[]> {
        const response = await this.getProductsPage(options);
        return response.products || [];
    }

    /**
     * Get a paginated list of products
     */
    async getProductsPage(options: ProductListOptions = {}): Promise<ProductListResponse> {
        const response: any = await this.adminClient.products.list(options);

        if (Array.isArray(response)) {
            return {
                products: response,
                total: response.length,
            };
        }

        return {
            products: response?.products || [],
            total: Number(response?.total || 0),
            totalAll: response?.totalAll,
            limit: response?.limit,
            offset: response?.offset,
            success: response?.success,
        };
    }

    /**
     * Search for products
     */
    async searchProducts(searchTerm: string): Promise<Product[]> {
        const response: any = await this.adminClient.products.search({ q: searchTerm });
        return Array.isArray(response) ? response : (response.products || []);
    }

    /**
     * Add a variant to a product
     * POST /catalog/products/admin/:productId/variants
     */
    async addVariant(productId: string, data: any): Promise<any> {
        return this.adminClient.variants.create(productId, data);
    }

    /**
     * Update an existing variant
     * PUT /catalog/products/admin/variants/:id
     */
    async updateVariant(id: string, data: any): Promise<any> {
        return this.adminClient.variants.update(id, data);
    }

    /**
     * Update stock for a variant
     * PATCH /catalog/products/admin/variants/:id/stock
     */
    async updateVariantStock(id: string, stockOnHand: number): Promise<any> {
        return this.adminClient.variants.updateStock(id, stockOnHand);
    }

    /**
     * Add an asset to a product
     * POST /catalog/products/admin/:productId/assets
     */
    async addAsset(productId: string, data: { assetId: string; sortOrder?: number; featured?: boolean }): Promise<any> {
        return this.adminClient.productAssets.add(productId, data);
    }

    /**
     * Remove an asset from a product
     * DELETE /catalog/products/admin/:productId/assets/:assetId
     */
    async removeAsset(productId: string, assetId: string): Promise<boolean> {
        await this.adminClient.productAssets.remove(productId, assetId);
        return true;
    }

    /**
     * Set the featured asset for a product
     * PATCH /catalog/products/admin/:productId/assets/:assetId/featured
     */
    async setFeaturedAsset(productId: string, assetId: string): Promise<any> {
        return this.adminClient.productAssets.setFeatured(productId, assetId);
    }

    /**
     * Enhanced product search with optional filtering options
     * GET /catalog/products/admin/search?q=<searchTerm>[&...options]
     */
    async searchProductsEnhanced(searchTerm: string, options?: Record<string, any>): Promise<any[]> {
        const response: any = await this.adminClient.products.search({ q: searchTerm, ...options });
        return Array.isArray(response) ? response : (response.products || response.results || []);
    }
}
