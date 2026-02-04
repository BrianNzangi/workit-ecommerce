import { AssetService } from '@/lib/services';
import { AssetType } from '@/lib/shared/types';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const assetQueries = {
    asset: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const assetService = new AssetService();
        return await assetService.getAsset(id);
    },

    assets: async (
        _parent: any,
        { options }: { options?: { type?: AssetType; take?: number; skip?: number } },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const assetService = new AssetService();
        return await assetService.getAssets(options?.type, options?.take, options?.skip);
    },
};
