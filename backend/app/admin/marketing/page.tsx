'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    Mail,
    Users,
    TrendingUp,
    MousePointerClick,
    DollarSign,
    BarChart3,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';

interface MarketingStats {
    totalCampaigns: number;
    activeCampaigns: number;
    totalSubscribers: number;
    emailsSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
    revenue: number;
}

export default function MarketingAnalyticsPage() {
    const [stats, setStats] = useState<MarketingStats>({
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalSubscribers: 0,
        emailsSent: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        revenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMarketingStats();
    }, []);

    const fetchMarketingStats = async () => {
        try {
            const response = await fetch('/api/admin/marketing/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching marketing stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({
        title,
        value,
        icon: Icon,
        trend,
        trendValue,
        suffix = '',
    }: {
        title: string;
        value: number | string;
        icon: any;
        trend?: 'up' | 'down';
        trendValue?: string;
        suffix?: string;
    }) => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-[#FF5023]/10 rounded-lg">
                    <Icon className="w-5 h-5 text-[#FF5023]" />
                </div>
                {trend && trendValue && (
                    <div
                        className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}
                    >
                        {trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4" />
                        ) : (
                            <ArrowDownRight className="w-4 h-4" />
                        )}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">
                {value}
                {suffix}
            </p>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5023]"></div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Analytics</h1>
                        <p className="text-gray-600">
                            Track your marketing performance and campaign effectiveness
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Campaigns"
                            value={stats.totalCampaigns}
                            icon={Mail}
                            trend="up"
                            trendValue="12%"
                        />
                        <StatCard
                            title="Active Campaigns"
                            value={stats.activeCampaigns}
                            icon={BarChart3}
                        />
                        <StatCard
                            title="Total Subscribers"
                            value={stats.totalSubscribers.toLocaleString()}
                            icon={Users}
                            trend="up"
                            trendValue="8%"
                        />
                        <StatCard
                            title="Emails Sent"
                            value={stats.emailsSent.toLocaleString()}
                            icon={Mail}
                            trend="up"
                            trendValue="24%"
                        />
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Open Rate"
                            value={stats.openRate.toFixed(1)}
                            suffix="%"
                            icon={MousePointerClick}
                            trend="up"
                            trendValue="3.2%"
                        />
                        <StatCard
                            title="Click Rate"
                            value={stats.clickRate.toFixed(1)}
                            suffix="%"
                            icon={MousePointerClick}
                            trend="down"
                            trendValue="1.5%"
                        />
                        <StatCard
                            title="Conversion Rate"
                            value={stats.conversionRate.toFixed(1)}
                            suffix="%"
                            icon={TrendingUp}
                            trend="up"
                            trendValue="5.8%"
                        />
                        <StatCard
                            title="Revenue Generated"
                            value={`$${(stats.revenue / 100).toLocaleString()}`}
                            icon={DollarSign}
                            trend="up"
                            trendValue="18%"
                        />
                    </div>

                    {/* Recent Campaigns */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent Campaigns</h2>
                            <button className="text-[#FF5023] hover:text-[#E64519] text-sm font-medium">
                                View All
                            </button>
                        </div>
                        <div className="text-center py-12 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p>No campaigns yet. Create your first campaign to get started.</p>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
