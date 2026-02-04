import { AssetService } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const assetMutations = {
    uploadAsset: async (
        _parent: any,
        { input }: { input: { file: string; fileName: string; mimeType: string; folder?: string } },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const assetService = new AssetService();

        // Convert base64 string to Buffer
        const fileBuffer = Buffer.from(input.file, 'base64');

        const result = await assetService.uploadAsset({
            file: fileBuffer,
            fileName: input.fileName,
            mimeType: input.mimeType,
            folder: input.folder,
        });

        return { asset: result.asset };
    },

    deleteAsset: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const assetService = new AssetService();
        return await assetService.deleteAsset(id);
    },
};
