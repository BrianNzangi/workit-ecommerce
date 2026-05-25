import { CollectionService, CollectionListOptions } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '../../context';

export const collectionQueries = {
    collection: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const collectionService = new CollectionService();
            return await collectionService.getCollection(id);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    collections: async (
        _parent: any,
        { options }: { options?: CollectionListOptions },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const collectionService = new CollectionService();
            return await collectionService.getCollections(options);
        } catch (error) {
            throw mapHttpError(error);
        }
    },
};
