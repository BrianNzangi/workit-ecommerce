import { BannerService, BannerListOptions } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const bannerQueries = {
    banner: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const bannerService = new BannerService();
        return await bannerService.getBanner(id);
    },

    bannerBySlug: async (
        _parent: any,
        { slug }: { slug: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const bannerService = new BannerService();
        return await bannerService.getBannerBySlug(slug);
    },

    banners: async (
        _parent: any,
        { options }: { options?: BannerListOptions },
        _context: GraphQLContext
    ) => {
        const bannerService = new BannerService();
        return await bannerService.getBanners(options);
    },
};
