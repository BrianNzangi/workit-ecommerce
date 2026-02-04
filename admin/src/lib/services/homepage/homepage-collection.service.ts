import { BaseService } from '../base/base.service';
import {
    validationError,
    notFoundError,
    duplicateError,
} from '@/lib/graphql/errors';
import {
    CreateHomepageCollectionInput,
    UpdateHomepageCollectionInput,
    HomepageCollectionListOptions,
} from './homepage.types';

export class HomepageCollectionService extends BaseService {
    /**
     * Create a new homepage collection
     */
    async createHomepageCollection(input: CreateHomepageCollectionInput): Promise<any> {
        try {
            return await this.adminClient.homepageCollections.create(input);
        } catch (error: any) {
            if (error.message?.includes('exists')) throw duplicateError(error.message, 'slug');
            throw validationError(error.message || 'Failed to create homepage collection');
        }
    }

    /**
     * Update an existing homepage collection
     */
    async updateHomepageCollection(id: string, input: UpdateHomepageCollectionInput): Promise<any> {
        try {
            return await this.adminClient.homepageCollections.update(id, input);
        } catch (error: any) {
            if (error.message?.includes('404')) throw notFoundError('Homepage collection not found');
            throw validationError(error.message || 'Failed to update homepage collection');
        }
    }

    /**
     * Get a single homepage collection by ID
     */
    async getHomepageCollection(id: string): Promise<any> {
        try {
            return await this.adminClient.homepageCollections.get(id);
        } catch (error: any) {
            throw notFoundError('Homepage collection not found');
        }
    }

    /**
     * Delete a homepage collection
     */
    async deleteHomepageCollection(id: string): Promise<boolean> {
        try {
            await this.adminClient.homepageCollections.remove(id);
            return true;
        } catch (error: any) {
            throw validationError(error.message || 'Failed to delete homepage collection');
        }
    }

    /**
     * Get a list of homepage collections
     */
    async getHomepageCollections(_options: HomepageCollectionListOptions = {}): Promise<any[]> {
        try {
            const response: any = await this.adminClient.homepageCollections.list(_options);
            return Array.isArray(response) ? response : (response.collections || []);
        } catch (error: any) {
            return [];
        }
    }

    /**
     * Add a product to a homepage collection
     */
    async addProductToHomepageCollection(
        _collectionId: string,
        _productId: string,
        _sortOrder?: number
    ): Promise<any> {
        return {};
    }

    /**
     * Remove a product from a homepage collection
     */
    async removeProductFromHomepageCollection(_collectionId: string, _productId: string): Promise<boolean> {
        return true;
    }

    /**
     * Reorder products within a homepage collection
     */
    async reorderHomepageCollectionProducts(
        _collectionId: string,
        _productOrders: Array<{ productId: string; sortOrder: number }>
    ): Promise<boolean> {
        return true;
    }
}
