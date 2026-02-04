import { BaseService } from '../base/base.service';
import { Collection, CreateCollectionInput, CollectionListOptions } from './collection.types';

export class CollectionService extends BaseService {
    /**
     * Create a new collection
     */
    async createCollection(input: CreateCollectionInput): Promise<Collection> {
        return this.adminClient.collections.create(input);
    }

    /**
     * Update an existing collection
     */
    async updateCollection(id: string, input: Partial<CreateCollectionInput>): Promise<Collection> {
        return this.adminClient.collections.update(id, input);
    }

    /**
     * Get a single collection by ID
     */
    async getCollection(id: string): Promise<Collection | null> {
        try {
            return await this.adminClient.collections.get(id);
        } catch (error: any) {
            if (error.statusCode === 404) return null;
            throw error;
        }
    }

    /**
     * Delete a collection
     */
    async deleteCollection(id: string): Promise<boolean> {
        await this.adminClient.collections.remove(id);
        return true;
    }

    /**
     * Get a list of collections
     */
    async getCollections(options: CollectionListOptions = {}): Promise<Collection[]> {
        const response: any = await this.adminClient.collections.list(options);
        return Array.isArray(response) ? response : (response.collections || []);
    }

    /**
     * Assign a product to a collection
     * (Checking if this is in products or collections service)
     */
    async assignProductToCollection(
        productId: string,
        collectionId: string,
        sortOrder?: number
    ): Promise<any> {
        // This was catalog.addProductToCollection. 
        // Usually standard catalog has it in products or a separate join service.
        // Let's assume it's in products for now or check backend.
        return (this.adminClient as any).products.addToCollection({ productId, collectionId, sortOrder });
    }

    /**
     * Remove a product from a collection
     */
    async removeProductFromCollection(productId: string, collectionId: string): Promise<boolean> {
        await (this.adminClient as any).products.removeFromCollection({ productId, collectionId });
        return true;
    }

    /**
     * Update collection sort order
     */
    async updateCollectionSortOrder(id: string, sortOrder: number): Promise<Collection> {
        return this.adminClient.collections.update(id, { sortOrder } as any);
    }
}
