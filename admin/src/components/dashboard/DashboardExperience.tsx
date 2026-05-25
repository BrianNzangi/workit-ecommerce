'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, PackagePlus, ShoppingCart, Users, Megaphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DateRange } from 'react-day-picker';
import { ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import { DashboardMonthlyTargetPanel } from './DashboardMonthlyTargetPanel';
import { DashboardRecentOrdersCard } from './DashboardRecentOrdersCard';
import { DashboardRevenuePanel } from './DashboardRevenuePanel';
import { DashboardSalesByLocationPanel } from './DashboardSalesByLocationPanel';
import { DashboardSalesMixPanel } from './DashboardSalesMixPanel';
import { DashboardStatCard } from './DashboardStatCard';
import { formatCount, formatMoneyCompact } from './dashboard.utils';
import { useDashboardOverview } from './useDashboardOverview';
import { ActivityFeed } from './ActivityFeed';

type TimePeriod = 'day' | 'week' | 'month' | 'year';

export function DashboardExperience() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
    });
    const [period, setPeriod] = useState<TimePeriod>('week');
    const { data, loading } = useDashboardOverview();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        {dateRange?.from && dateRange?.to
                            ? `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                            : 'Select a date range'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, 'LLL dd, y')} -{' '}
                                            {format(dateRange.to, 'LLL dd, y')}
                                        </>
                                    ) : (
                                        format(dateRange.from, 'LLL dd, y')
                                    )
                                ) : (
                                    'Pick a date'
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                defaultMonth={dateRange?.from}
                            />
                        </PopoverContent>
                    </Popover>
                    <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
                        <TabsList>
                            <TabsTrigger value="day">Day</TabsTrigger>
                            <TabsTrigger value="week">Week</TabsTrigger>
                            <TabsTrigger value="month">Month</TabsTrigger>
                            <TabsTrigger value="year">Year</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardStatCard
                    icon={Wallet}
                    label="Total Sales"
                    value={loading ? '...' : formatMoneyCompact(data.summary.totalSales)}
                    helper="Settled, shipped, and delivered orders"
                    change={data.summary.salesGrowth}
                />
                <DashboardStatCard
                    icon={ShoppingBag}
                    label="Total Orders"
                    value={loading ? '...' : formatCount(data.summary.totalOrders)}
                    helper="Live order count from commerce backend"
                />
                <DashboardStatCard
                    icon={TrendingUp}
                    label="Total Revenue"
                    value={loading ? '...' : formatMoneyCompact(data.summary.totalRevenue)}
                    helper="Current month revenue"
                    change={data.summary.revenueGrowth}
                />
                <DashboardStatCard
                    icon={Users}
                    label="Total Customers"
                    value={loading ? '...' : formatCount(data.summary.totalCustomers)}
                    helper="Customer accounts in identity store"
                />
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks to get started quickly</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="gap-2">
                            <PackagePlus className="h-4 w-4" />
                            Add Product
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            View Orders
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Users className="h-4 w-4" />
                            Manage Customers
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Megaphone className="h-4 w-4" />
                            Create Campaign
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <DashboardRevenuePanel revenueTrend={data.revenueTrend} revenueLegend={data.revenueLegend} />

            <DashboardRecentOrdersCard orders={data.recentOrders} loading={loading} />

            <div className="grid gap-4 md:grid-cols-3">
                <DashboardSalesByLocationPanel locationSales={data.locationSales} />
                <DashboardSalesMixPanel salesMix={data.salesMix} />
                <DashboardMonthlyTargetPanel monthlyTarget={data.monthlyTarget} />
            </div>

            <ActivityFeed
                lowStockProducts={data.summary.stockProducts}
                outOfStock={data.summary.outOfStock}
                totalCustomers={data.summary.totalCustomers}
                recentOrders={data.recentOrders}
            />
        </div>
    );
}
