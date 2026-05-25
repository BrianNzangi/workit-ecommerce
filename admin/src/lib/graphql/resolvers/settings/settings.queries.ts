import { AdminSettingsService } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '../../context';

export const settingsQueries = {
    siteSettings: async (
        _parent: any,
        _args: any,
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const settingsService = new AdminSettingsService();
            const result = await settingsService.getSettings();
            return { data: result };
        } catch (error) {
            throw mapHttpError(error);
        }
    },
};
