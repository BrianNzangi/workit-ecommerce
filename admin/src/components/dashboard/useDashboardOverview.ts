'use client';

import { useEffect, useState } from 'react';
import { AnalyticsService, type DashboardOverviewResponse } from '@/lib/services';

const EMPTY_DASHBOARD: DashboardOverviewResponse = {
    summary: {
        totalSales: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        stockProducts: 0,
        outOfStock: 0,
        salesGrowth: 0,
        revenueGrowth: 0,
    },
    revenueTrend: [],
    revenueLegend: {
        currentWeekTotal: 0,
        previousWeekTotal: 0,
    },
    locationSales: [],
    salesMix: [],
    monthlyTarget: {
        target: 0,
        revenue: 0,
        today: 0,
        progress: 0,
    },
    recentOrders: [],
};

export function useDashboardOverview() {
    const [data, setData] = useState<DashboardOverviewResponse>(EMPTY_DASHBOARD);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const analyticsService = new AnalyticsService();

        const loadDashboard = async (backgroundRefresh = false) => {
            if (!backgroundRefresh) {
                setLoading(true);
            }

            try {
                const nextData = await analyticsService.getDashboardOverview();
                if (active) {
                    setData(nextData);
                }
            } catch (error) {
                console.error('Error loading dashboard overview:', error);
            } finally {
                if (active && !backgroundRefresh) {
                    setLoading(false);
                }
            }
        };

        void loadDashboard();

        const refreshTimer = window.setInterval(() => {
            void loadDashboard(true);
        }, 30000);

        return () => {
            active = false;
            window.clearInterval(refreshTimer);
        };
    }, []);

    return { data, loading };
}
