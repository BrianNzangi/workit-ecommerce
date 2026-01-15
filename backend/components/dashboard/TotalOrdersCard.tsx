'use client';

import { useState, useEffect, useRef } from 'react';
import { EllipsisVertical, TrendingUp } from 'lucide-react';
import { TimeRange } from './TimeFilter';

interface OrdersData {
    current: number;
    previous: number;
    percentageChange: number;
}

const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '1m', label: 'Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '12m', label: '12 Months' },
];

export function TotalOrdersCard() {
    const [timeRange, setTimeRange] = useState<TimeRange>('24h');
    const [ordersData, setOrdersData] = useState<OrdersData>({
        current: 0,
        previous: 0,
        percentageChange: 0,
    });
    const [loading, setLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchOrdersData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/admin/dashboard/orders?range=${timeRange}`);
                if (response.ok) {
                    const data = await response.json();
                    setOrdersData(data);
                }
            } catch (error) {
                console.error('Error fetching orders data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrdersData();
    }, [timeRange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };

    const getTimeRangeLabel = () => {
        const range = timeRanges.find(r => r.value === timeRange);
        return range ? range.label.replace('Hours', 'hours').replace('Days', 'days').toLowerCase() : '';
    };

    const isPositive = ordersData.percentageChange >= 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">Total Orders</h3>
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <EllipsisVertical className="w-5 h-5 text-gray-500" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            {timeRanges.map((range) => (
                                <button
                                    key={range.value}
                                    onClick={() => {
                                        setTimeRange(range.value);
                                        setShowMenu(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${timeRange === range.value ? 'text-primary-600 font-medium' : 'text-gray-700'
                                        }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <p className="text-xs text-gray-500 mb-4">Last {getTimeRangeLabel()}</p>

            {/* Main Value */}
            <div className="mb-3">
                {loading ? (
                    <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-4xl font-bold text-gray-900">
                            {formatNumber(ordersData.current)}
                        </h2>
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-600">order</span>
                            <div className={`flex items-center gap-0.5 ${isPositive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                <TrendingUp className={`w-3.5 h-3.5 ${!isPositive && 'rotate-180'}`} />
                                <span className="text-sm font-semibold">
                                    {Math.abs(ordersData.percentageChange).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Previous Period */}
            <div className="text-xs text-gray-500 mb-4">
                Previous {getTimeRangeLabel()} ({formatNumber(ordersData.previous)})
            </div>

            {/* Details Button */}
            <div className="flex justify-end">
                <button className="px-16 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-900 hover:text-white transition-colors">
                    Details
                </button>
            </div>
        </div>
    );
}
