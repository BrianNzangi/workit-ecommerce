import { AnalyticsService } from '@/lib/services';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import type { GraphQLContext } from '../../context';

export const analyticsQueries = {
    getDashboardStats: async (
        _parent: any,
        { startDate, endDate }: { startDate: Date; endDate: Date },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const analyticsService = new AnalyticsService();
        return await analyticsService.getDashboardStats(startDate, endDate);
    },

    getRecentOrders: async (
        _parent: any,
        { limit }: { limit?: number },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const analyticsService = new AnalyticsService();
        return await analyticsService.getRecentOrders(limit);
    },

    getLowStockAlerts: async (
        _parent: any,
        { threshold }: { threshold?: number },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const analyticsService = new AnalyticsService();
        return await analyticsService.getLowStockAlerts(threshold);
    },

    getTopSellingProducts: async (
        _parent: any,
        { startDate, endDate, limit }: { startDate: Date; endDate: Date; limit?: number },
        context: GraphQLContext
    ) => {
        requireAuth(context.auth);
        const analyticsService = new AnalyticsService();
        return await analyticsService.getTopSellingProducts(startDate, endDate, limit);
    },
};
