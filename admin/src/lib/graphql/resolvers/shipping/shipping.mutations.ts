import { ShippingMethodService, CreateShippingMethodInput, AdminSettingsService, type ShippingZoneInput } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { mapHttpError } from '@/lib/graphql/errors';
import type { GraphQLContext } from '../../context';

export const shippingMutations = {
    createShippingMethod: async (
        _parent: any,
        { input }: { input: CreateShippingMethodInput },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const shippingMethodService = new ShippingMethodService();
        return await shippingMethodService.createShippingMethod(input);
    },

    updateShippingMethod: async (
        _parent: any,
        { id, input }: { id: string; input: Partial<CreateShippingMethodInput> },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const shippingMethodService = new ShippingMethodService();
        return await shippingMethodService.updateShippingMethod(id, input);
    },

    deleteShippingMethod: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const shippingMethodService = new ShippingMethodService();
        return await shippingMethodService.deleteShippingMethod(id);
    },

    createShippingZone: async (
        _parent: any,
        { input }: { input: ShippingZoneInput },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const settingsService = new AdminSettingsService();
            return await settingsService.createShippingZone(input);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    updateShippingZone: async (
        _parent: any,
        { id, input }: { id: string; input: ShippingZoneInput },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const settingsService = new AdminSettingsService();
            return await settingsService.updateShippingZone(id, input);
        } catch (error) {
            throw mapHttpError(error);
        }
    },

    deleteShippingZone: async (
        _parent: any,
        { id }: { id: string },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        try {
            const settingsService = new AdminSettingsService();
            await settingsService.deleteShippingZone(id);
            return true;
        } catch (error) {
            throw mapHttpError(error);
        }
    },
};
