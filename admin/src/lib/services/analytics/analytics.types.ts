import { analytics } from '@workit/api';

export type StatsResponse = analytics.StatsResponse;
export type SalesStatsResponse = analytics.SalesStatsResponse;
export type RecentOrder = analytics.RecentOrder;
export type ChartResponse = analytics.ChartResponse;

export interface DashboardStats {
    totalRevenue: number;
    orderCount: number;
    period: {
        start: Date;
        end: Date;
    };
}
