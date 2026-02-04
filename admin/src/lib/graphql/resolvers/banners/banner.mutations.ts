import { BannerService, CreateBannerInput } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
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
};
