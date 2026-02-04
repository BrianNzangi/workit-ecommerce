import { BaseService } from '../base/base.service';
import {
    StatsResponse,
    SalesStatsResponse,
    RecentOrder,
    ChartResponse,
} from './analytics.types';

export class AnalyticsService extends BaseService {
    /**
     * Get weekly dashboard statistics.
     */
    async getDashboardSummary(): Promise<StatsResponse> {
        return this.adminClient.analytics.getWeeklyStats();
    }

    /**
     * Get sales stats with percentage change (Satisfies old UI components).
     */
    async getSalesStats(_range?: string): Promise<SalesStatsResponse> {
        const stats = await this.adminClient.analytics.getSalesStats();
        return {
            current: stats.totalSales || 0,
            previous: 0,
            percentageChange: stats.growth || 0,
        };
    }

    /**
     * Get order stats with percentage change (Satisfies old UI components).
     */
    async getOrderStats(_range?: string): Promise<{ current: number; previous: number; percentageChange: number }> {
        const stats = await this.adminClient.analytics.getWeeklyStats();
        return {
            current: stats.orders || 0,
            previous: 0, // Not available in weekly-stats yet
            percentageChange: 0, // Not available yet
        };
    }

    /**
     * Get weekly chart data.
     */
    async getWeeklyChart(): Promise<ChartResponse> {
        return this.adminClient.analytics.getWeeklyChart();
    }

    /**
     * Get recent orders for dashboard.
     */
    async getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
        const response = await this.adminClient.analytics.getRecentOrders({ limit });
        return response.orders;
    }

    // Legacy wrappers for compatibility
    async getDashboardStats(_startDate: Date, _endDate: Date): Promise<any> {
        const stats = await this.getDashboardSummary();
        return {
            totalRevenue: stats.revenue,
            orderCount: 0, // Not explicitly in weekly stats yet
            period: { start: _startDate, end: _endDate },
        };
    }

    async getLowStockAlerts(threshold?: number): Promise<any[]> {
        return []; // To be implemented in backend
    }

    async getTopSellingProducts(startDate?: Date, endDate?: Date, limit?: number): Promise<any[]> {
        return []; // To be implemented in backend
    }
}
