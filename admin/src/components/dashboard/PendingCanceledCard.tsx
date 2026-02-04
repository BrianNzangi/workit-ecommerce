'use client';

import { useState, useEffect, useRef } from 'react';
import { EllipsisVertical, TrendingUp } from 'lucide-react';
import { TimeRange } from './TimeFilter';

interface PendingCanceledData {
    pending: {
        count: number;
        percentageChange: number;
    };
    canceled: {
        count: number;
        percentageChange: number;
    };
}

const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '1m', label: 'Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '12m', label: '12 Months' },
];

export function PendingCanceledCard() {
    const [timeRange, setTimeRange] = useState<TimeRange>('24h');
    const [data, setData] = useState<PendingCanceledData>({
        pending: { count: 0, percentageChange: 0 },
        canceled: { count: 0, percentageChange: 0 },
    });
    const [loading, setLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/admin/dashboard/pending-canceled?range=${timeRange}`);
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error('Error fetching pending/canceled data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

    const getTimeRangeLabel = () => {
        const range = timeRanges.find(r => r.value === timeRange);
        return range ? range.label.replace('Hours', 'hours').replace('Days', 'days').toLowerCase() : '';
    };

    const isPendingPositive = data.pending.percentageChange >= 0;
    const isCanceledPositive = data.canceled.percentageChange >= 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">Pending & Canceled</h3>
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

            {/* Pending and Canceled Stats - Horizontal Layout with Separator */}
            <div className="grid grid-cols-2 divide-x divide-gray-200 mb-3">
                {/* Pending */}
                <div className="pr-4">
                    <p className="text-xs text-gray-600 mb-3">Pending</p>
                    {loading ? (
                        <div className="h-10 w-20 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                        <div className="flex items-baseline gap-3">
                            <h2 className="text-4xl font-bold text-gray-900">{data.pending.count}</h2>
                            <span className="text-xs text-gray-500">user {data.canceled.count}</span>
                        </div>
                    )}
                </div>

                {/* Canceled */}
                <div className="pl-4">
                    <p className="text-xs text-gray-600 mb-3">Canceled</p>
                    {loading ? (
                        <div className="h-10 w-20 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                        <div className="flex items-baseline gap-3">
                            <h2 className="text-4xl font-bold text-gray-900">{data.canceled.count}</h2>
                            <div className={`flex items-center gap-0.5 ${isCanceledPositive ? 'text-red-600' : 'text-green-600'
                                }`}>
                                <TrendingUp className={`w-3.5 h-3.5 ${!isCanceledPositive && 'rotate-180'}`} />
                                <span className="text-sm font-semibold">
                                    {Math.abs(data.canceled.percentageChange).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>
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
