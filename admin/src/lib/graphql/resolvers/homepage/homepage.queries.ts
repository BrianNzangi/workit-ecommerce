import { HomepageCollectionService, HomepageCollectionListOptions } from '@/lib/services';
import type { GraphQLContext } from '../../context';

export const homepageQueries = {
    homepageCollection: async (
        _parent: any,
        { id }: { id: string },
        _context: GraphQLContext
    ) => {
        const homepageCollectionService = new HomepageCollectionService();
        return await homepageCollectionService.getHomepageCollection(id);
    },

    homepageCollections: async (
        _parent: any,
        { options }: { options?: HomepageCollectionListOptions },
        _context: GraphQLContext
    ) => {
        const homepageCollectionService = new HomepageCollectionService();
        return await homepageCollectionService.getHomepageCollections(options);
    },
};
