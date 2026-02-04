'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    Mail,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';

interface AnalyticsData {
    revenue: {
        total: number;
        change: number;
        trend: 'up' | 'down';
    };
    orders: {
        total: number;
        change: number;
        trend: 'up' | 'down';
    };
    customers: {
        total: number;
        change: number;
        trend: 'up' | 'down';
    };
    products: {
        total: number;
        change: number;
        trend: 'up' | 'down';
    };
    campaigns: {
        total: number;
        openRate: number;
        clickRate: number;
    };
    topProducts: Array<{
        id: string;
        name: string;
        sales: number;
        revenue: number;
    }>;
    recentOrders: Array<{
        id: string;
        code: string;
        customer: string;
        total: number;
        status: string;
        createdAt: Date;
    }>;
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
            if (response.ok) {
                const data = await response.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount / 100);
    };

    const StatCard = ({
        title,
        value,
        change,
        trend,
        icon: Icon,
        color,
    }: {
        title: string;
        value: string | number;
        change?: number;
        trend?: 'up' | 'down';
        icon: any;
        color: string;
    }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {change !== undefined && trend && (
                    <div
                        className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}
                    >
                        {trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4" />
                        ) : (
                            <ArrowDownRight className="w-4 h-4" />
                        )}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-sm text-gray-600">{title}</p>
        </div>
    );

    if (loading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5023]"></div>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
                            <p className="text-gray-600">
                                Track your store performance and key metrics
                            </p>
                        </div>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Revenue"
                            value={formatCurrency(analytics?.revenue.total || 0)}
                            change={analytics?.revenue.change}
                            trend={analytics?.revenue.trend}
                            icon={DollarSign}
                            color="bg-green-500"
                        />
                        <StatCard
                            title="Total Orders"
                            value={analytics?.orders.total || 0}
                            change={analytics?.orders.change}
                            trend={analytics?.orders.trend}
                            icon={ShoppingCart}
                            color="bg-blue-500"
                        />
                        <StatCard
                            title="Total Customers"
                            value={analytics?.customers.total || 0}
                            change={analytics?.customers.change}
                            trend={analytics?.customers.trend}
                            icon={Users}
                            color="bg-purple-500"
                        />
                        <StatCard
                            title="Total Products"
                            value={analytics?.products.total || 0}
                            change={analytics?.products.change}
                            trend={analytics?.products.trend}
                            icon={Package}
                            color="bg-orange-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Campaign Performance */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Mail className="w-5 h-5 text-[#FF5023]" />
                                <h2 className="text-lg font-bold text-gray-900">
                                    Campaign Performance
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Total Campaigns</span>
                                        <span className="text-lg font-bold text-gray-900">
                                            {analytics?.campaigns.total || 0}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Average Open Rate</span>
                                        <span className="text-lg font-bold text-green-600">
                                            {analytics?.campaigns.openRate.toFixed(1) || 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{
                                                width: `${analytics?.campaigns.openRate || 0}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Average Click Rate</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {analytics?.campaigns.clickRate.toFixed(1) || 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{
                                                width: `${analytics?.campaigns.clickRate || 0}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <TrendingUp className="w-5 h-5 text-[#FF5023]" />
                                <h2 className="text-lg font-bold text-gray-900">Top Products</h2>
                            </div>
                            <div className="space-y-4">
                                {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                                    analytics.topProducts.map((product, index) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-bold text-gray-600">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {product.sales} sales
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">
                                                {formatCurrency(product.revenue)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm">No product data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-[#FF5023]" />
                                <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            {analytics?.recentOrders && analytics.recentOrders.length > 0 ? (
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {analytics.recentOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {order.code}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {order.customer}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {formatCurrency(order.total)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p>No recent orders</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
