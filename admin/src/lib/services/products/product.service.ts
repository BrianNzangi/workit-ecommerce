import { BaseService } from '../base/base.service';
import { Product, CreateProductInput, ProductListOptions } from './product.types';

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
        const response: any = await this.adminClient.products.list(options);
        // Handle both raw array and wrapped object (legacy)
        return Array.isArray(response) ? response : (response.products || []);
    }

    /**
     * Search for products
     */
    async searchProducts(searchTerm: string): Promise<Product[]> {
        const response: any = await this.adminClient.products.search({ q: searchTerm });
        return Array.isArray(response) ? response : (response.products || []);
    }
}
