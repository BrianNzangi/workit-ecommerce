import { HomepageCollectionService, CreateHomepageCollectionInput, UpdateHomepageCollectionInput } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const homepageMutations = {
    createHomepageCollection: async (
        _parent: any,
        { input }: { input: CreateHomepageCollectionInput },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const homepageCollectionService = new HomepageCollectionService();
        return await homepageCollectionService.createHomepageCollection(input);
    },

    updateHomepageCollection: async (
        _parent: any,
        { id, input }: { id: string; input: UpdateHomepageCollectionInput },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const homepageCollectionService = new HomepageCollectionService();
        return await homepageCollectionService.updateHomepageCollection(id, input);
    },

    addProductToHomepageCollection: async (
        _parent: any,
        { collectionId, productId, sortOrder }: { collectionId: string; productId: string; sortOrder?: number },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const homepageCollectionService = new HomepageCollectionService();
        return await homepageCollectionService.addProductToHomepageCollection(collectionId, productId, sortOrder);
    },

    removeProductFromHomepageCollection: async (
        _parent: any,
        { collectionId, productId }: { collectionId: string; productId: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const homepageCollectionService = new HomepageCollectionService();
        return await homepageCollectionService.removeProductFromHomepageCollection(collectionId, productId);
    },

    reorderHomepageCollectionProducts: async (
        _parent: any,
        { collectionId, productOrders }: { collectionId: string; productOrders: Array<{ productId: string; sortOrder: number }> },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const homepageCollectionService = new HomepageCollectionService();
        return await homepageCollectionService.reorderHomepageCollectionProducts(collectionId, productOrders);
    },
};
