'use client';

import { ShoppingBag, TrendingUp, Users, Wallet } from 'lucide-react';
import { DashboardMonthlyTargetPanel } from './DashboardMonthlyTargetPanel';
import { DashboardRecentOrdersCard } from './DashboardRecentOrdersCard';
import { DashboardRevenuePanel } from './DashboardRevenuePanel';
import { DashboardSalesByLocationPanel } from './DashboardSalesByLocationPanel';
import { DashboardSalesMixPanel } from './DashboardSalesMixPanel';
import { DashboardStatCard } from './DashboardStatCard';
import { formatCount, formatMoneyCompact } from './dashboard.utils';
import { useDashboardOverview } from './useDashboardOverview';

export function DashboardExperience() {
    const { data, loading } = useDashboardOverview();

    return (
        <div className="space-y-6">
            <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
                <DashboardStatCard
                    icon={Wallet}
                    label="Total Sales"
                    value={loading ? 'Loading...' : formatMoneyCompact(data.summary.totalSales)}
                    helper="Real sales value aggregated from settled, shipped, and delivered orders."
                    change={data.summary.salesGrowth}
                    accent="bg-primary-50 text-primary-900"
                />
                <DashboardStatCard
                    icon={ShoppingBag}
                    label="Total Orders"
                    value={loading ? 'Loading...' : formatCount(data.summary.totalOrders)}
                    helper="Live order count currently stored in the commerce backend."
                    accent="bg-secondary-100 text-secondary-900"
                />
                <DashboardStatCard
                    icon={TrendingUp}
                    label="Total Revenue"
                    value={loading ? 'Loading...' : formatMoneyCompact(data.summary.totalRevenue)}
                    helper="Current month revenue based on real completed order flow."
                    change={data.summary.revenueGrowth}
                    accent="bg-primary-100 text-primary-900"
                />
                <DashboardStatCard
                    icon={Users}
                    label="Total Customers"
                    value={loading ? 'Loading...' : formatCount(data.summary.totalCustomers)}
                    helper="Customer accounts counted directly from the identity store."
                    accent="bg-secondary-50 text-secondary-900"
                />
            </div>

            <div className="grid items-stretch gap-6 xl:grid-cols-12">
                <div className="xl:col-span-7">
                    <DashboardRevenuePanel revenueTrend={data.revenueTrend} revenueLegend={data.revenueLegend} />
                </div>
                <div className="xl:col-span-3">
                    <DashboardSalesByLocationPanel locationSales={data.locationSales} />
                </div>
                <div className="xl:col-span-2">
                    <DashboardSalesMixPanel salesMix={data.salesMix} />
                </div>
            </div>

            <div className="grid items-stretch gap-6 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    <div className="h-full rounded-lg border border-gray-200 bg-white shadow-[0_18px_45px_-32px_rgba(6,7,9,0.35)]">
                        <DashboardRecentOrdersCard orders={data.recentOrders} loading={loading} />
                    </div>
                </div>
                <div className="xl:col-span-4">
                    <DashboardMonthlyTargetPanel monthlyTarget={data.monthlyTarget} />
                </div>
            </div>
        </div>
    );
}
