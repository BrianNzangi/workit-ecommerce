import { CollectionService, CollectionListOptions } from '@/lib/services';
import type { GraphQLContext } from '../../context';

export const collectionQueries = {
    collection: async (
        _parent: any,
        { id }: { id: string },
        _context: GraphQLContext
    ) => {
        const collectionService = new CollectionService();
        return await collectionService.getCollection(id);
    },

    collections: async (
        _parent: any,
        { options }: { options?: CollectionListOptions },
        _context: GraphQLContext
    ) => {
        const collectionService = new CollectionService();
        return await collectionService.getCollections(options);
    },
};
