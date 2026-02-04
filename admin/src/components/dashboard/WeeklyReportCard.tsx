'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EllipsisVertical } from 'lucide-react';
import { AnalyticsService } from '@/lib/services';

// Mock data structure - will replace with API fetch
interface DailyData {
    day: string;
    value: number;
}

interface StatsData {
    customers: number;
    totalProducts: number;
    stockProducts: number;
    outOfStock: number;
    revenue: number;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#a3d9a5] p-3 rounded-lg shadow-sm border-none text-center min-w-[100px]">
                <p className="text-xs font-medium text-gray-800 mb-1">{label}</p>
                <p className="text-sm font-bold text-gray-900">
                    {payload[0].value >= 1000
                        ? `${(payload[0].value / 1000).toFixed(1)}k`
                        : payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

export function WeeklyReportCard() {
    const [view, setView] = useState<'this_week' | 'last_week'>('this_week');
    const [chartData, setChartData] = useState<DailyData[]>([]);
    const [stats, setStats] = useState<StatsData>({
        customers: 0,
        totalProducts: 0,
        stockProducts: 0,
        outOfStock: 0,
        revenue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const analyticsService = new AnalyticsService();

                // Fetch stats using service
                const statsData = await analyticsService.getDashboardSummary() as any;
                if (statsData) {
                    setStats({
                        customers: statsData.customers || 0,
                        totalProducts: statsData.products || 0,
                        stockProducts: 0, // Not available in backend yet
                        outOfStock: 0,    // Not available in backend yet
                        revenue: statsData.revenue || 0,
                    });
                }

                // Fetch chart data using service
                const chartResponse = await analyticsService.getWeeklyChart() as any;
                if (chartResponse && Array.isArray(chartResponse.data)) {
                    setChartData(chartResponse.data);
                } else if (Array.isArray(chartResponse)) {
                    // Handle if response is just the array
                    setChartData(chartResponse as any);
                }

            } catch (error) {
                console.error('Error fetching weekly report:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [view]);

    // Format numbers for display (e.g., 52k)
    const formatStat = (num: number) => {
        if (num === undefined || num === null) return '0';
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900">Report for this week</h3>
                <div className="flex items-center gap-2">
                    <div className="flex bg-[#f3f4f6] rounded-lg p-1">
                        <button
                            onClick={() => setView('this_week')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'this_week'
                                ? 'bg-white text-green-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            This week
                        </button>
                        <button
                            onClick={() => setView('last_week')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'last_week'
                                ? 'bg-white text-green-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Last week
                        </button>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded-md">
                        <EllipsisVertical className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-5 gap-4 mb-8">
                {[
                    { label: 'Customers', value: stats.customers },
                    { label: 'Total Products', value: stats.totalProducts },
                    { label: 'Stock Products', value: stats.stockProducts },
                    { label: 'Out of Stock', value: stats.outOfStock },
                    { label: 'Revenue', value: stats.revenue, isRevenue: true },
                ].map((stat, index) => (
                    <div key={index} className="flex flex-col">
                        <h4 className="text-3xl font-bold text-gray-900 mb-1">
                            {formatStat(stat.value)}
                        </h4>
                        <span className="text-sm text-gray-500 mb-3">{stat.label}</span>
                        {/* Green underline for active tab/card simulation - applied to first item for now or all? 
                The design shows only the first one has a green line. Let's replicate that logic roughly 
                or just visually distinct the first one if implied. 
                Based on image, Customers has green line. Let's make it conditional or static for now. 
            */}
                        {index === 0 && (
                            <div className="h-0.5 w-full bg-green-500 rounded-full mt-auto"></div>
                        )}
                        {index !== 0 && (
                            <div className="h-0.5 w-full bg-gray-100 rounded-full mt-auto"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            tickFormatter={(value) => `${value / 1000}k`}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22c55e', strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#22c55e"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
