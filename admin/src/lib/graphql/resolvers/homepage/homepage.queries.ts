import { HomepageCollectionService, HomepageCollectionListOptions } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '../../context';

export const homepageQueries = {
    homepageCollection: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const homepageCollectionService = new HomepageCollectionService();
            return await homepageCollectionService.getHomepageCollection(id);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    homepageCollections: async (
        _parent: any,
        { options }: { options?: HomepageCollectionListOptions },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const homepageCollectionService = new HomepageCollectionService();
            return await homepageCollectionService.getHomepageCollections(options);
        } catch (error) {
            throw mapHttpError(error);
        }
    },
};
