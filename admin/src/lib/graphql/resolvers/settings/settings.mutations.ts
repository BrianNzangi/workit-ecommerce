import { AdminSettingsService } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '../../context';

export const settingsMutations = {
    updateSiteSettings: async (
        _parent: any,
        { input }: { input: { data: Record<string, any> } },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const settingsService = new AdminSettingsService();
            const result = await settingsService.updateSettings(input.data);
            return { data: result };
        } catch (error) {
            throw mapHttpError(error);
        }
    },
};
