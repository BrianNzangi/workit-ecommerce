import { CollectionService, CreateCollectionInput } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const collectionMutations = {
    createCollection: async (
        _parent: any,
        { input }: { input: CreateCollectionInput },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const collectionService = new CollectionService();
        return await collectionService.createCollection(input);
    },

    updateCollection: async (
        _parent: any,
        { id, input }: { id: string; input: Partial<CreateCollectionInput> },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const collectionService = new CollectionService();
        return await collectionService.updateCollection(id, input);
    },

    assignProductToCollection: async (
        _parent: any,
        { productId, collectionId, sortOrder }: { productId: string; collectionId: string; sortOrder?: number },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const collectionService = new CollectionService();
        return await collectionService.assignProductToCollection(productId, collectionId, sortOrder);
    },

    removeProductFromCollection: async (
        _parent: any,
        { productId, collectionId }: { productId: string; collectionId: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const collectionService = new CollectionService();
        return await collectionService.removeProductFromCollection(productId, collectionId);
    },

    updateCollectionSortOrder: async (
        _parent: any,
        { id, sortOrder }: { id: string; sortOrder: number },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const collectionService = new CollectionService();
        return await collectionService.updateCollectionSortOrder(id, sortOrder);
    },
};
