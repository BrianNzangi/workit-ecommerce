import { ShippingMethodService, ShippingMethodListOptions, AdminSettingsService } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '../../context';

export const shippingQueries = {
    shippingMethod: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const shippingMethodService = new ShippingMethodService();
        return await shippingMethodService.getShippingMethod(id);
    },

    shippingMethods: async (
        _parent: any,
        { options }: { options?: ShippingMethodListOptions },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const shippingMethodService = new ShippingMethodService();
        return await shippingMethodService.getShippingMethods(options);
    },

    shippingZones: async (
        _parent: any,
        _args: any,
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const settingsService = new AdminSettingsService();
            const methods = await settingsService.getShippingMethods();
            const zones: any[] = [];
            for (const method of methods) {
                if (method.zones && Array.isArray(method.zones)) {
                    zones.push(...method.zones.map((z: any) => ({ ...z, shippingMethodId: method.id })));
                }
            }
            return zones;
        } catch (error) {
            throw mapHttpError(error);
        }
    },
};
