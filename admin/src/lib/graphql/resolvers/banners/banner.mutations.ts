import { BannerService, CreateBannerInput } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '../../context';

export const bannerMutations = {
    createBanner: async (
        _parent: any,
        { input }: { input: CreateBannerInput },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const bannerService = new BannerService();
        return await bannerService.createBanner(input);
    },

    updateBanner: async (
        _parent: any,
        { id, input }: { id: string; input: Partial<CreateBannerInput> },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const bannerService = new BannerService();
        return await bannerService.updateBanner(id, input);
    },

    deleteBanner: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const bannerService = new BannerService();
            return await bannerService.deleteBanner(id);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    bulkDeleteBanners: async (
        _parent: any,
        { ids }: { ids: string[] },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const bannerService = new BannerService();
            return await bannerService.bulkDelete(ids);
        } catch (error) {
            throw mapHttpError(error);
        }
    },
};
