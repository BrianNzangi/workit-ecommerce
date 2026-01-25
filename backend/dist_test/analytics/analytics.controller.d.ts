import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getWeeklyStats(range: string): Promise<{
        customers: number;
        totalProducts: number;
        stockProducts: number;
        outOfStock: number;
        revenue: number;
    }>;
    getWeeklyChart(range: string): Promise<{
        day: string;
        value: number;
    }[]>;
    getSalesStats(range: string): Promise<{
        current: number;
        previous: number;
        percentageChange: number;
    }>;
    getOrderStats(range: string): Promise<{
        current: number;
        previous: number;
        percentageChange: number;
    }>;
    getPendingCanceled(range: string): Promise<{
        pending: number;
        canceled: number;
    }>;
}
