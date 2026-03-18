import { analytics } from '@workit/api';

export type StatsResponse = analytics.StatsResponse;
export type SalesStatsResponse = analytics.SalesStatsResponse;
export type RecentOrder = analytics.RecentOrder;
export type ChartResponse = analytics.ChartResponse;

export interface DashboardSummaryResponse {
    totalSales: number;
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    stockProducts: number;
    outOfStock: number;
    salesGrowth: number;
    revenueGrowth: number;
}

export interface DashboardRevenuePoint {
    label: string;
    current: number;
    previous: number;
}

export interface DashboardLocationSale {
    city: string;
    amount: number;
    share: number;
}

export interface DashboardSalesMixEntry {
    name: string;
    value: number;
    amount: number;
}

export interface DashboardMonthlyTarget {
    target: number;
    revenue: number;
    today: number;
    progress: number;
}

export interface DashboardOverviewResponse {
    summary: DashboardSummaryResponse;
    revenueTrend: DashboardRevenuePoint[];
    revenueLegend: {
        currentWeekTotal: number;
        previousWeekTotal: number;
    };
    locationSales: DashboardLocationSale[];
    salesMix: DashboardSalesMixEntry[];
    monthlyTarget: DashboardMonthlyTarget;
    recentOrders: RecentOrder[];
}

export interface DashboardStats {
    totalRevenue: number;
    orderCount: number;
    period: {
        start: Date;
        end: Date;
    };
}
