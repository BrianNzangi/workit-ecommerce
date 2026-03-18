import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { DashboardOverviewResponse } from '@/lib/services';
import { DashboardPanel } from './DashboardPanel';
import { formatMoneyCompact } from './dashboard.utils';

function SalesTrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{label}</p>
            <div className="space-y-1.5 text-sm text-gray-600">
                {payload.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between gap-6">
                        <span>{entry.name}</span>
                        <span className="font-semibold text-gray-900">KSh {Math.round(entry.value).toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface DashboardRevenuePanelProps {
    revenueTrend: DashboardOverviewResponse['revenueTrend'];
    revenueLegend: DashboardOverviewResponse['revenueLegend'];
}

export function DashboardRevenuePanel({ revenueTrend, revenueLegend }: DashboardRevenuePanelProps) {
    const chartValues = revenueTrend.flatMap((point) => [point.current, point.previous]);
    const yAxisMin = chartValues.length ? Math.min(...chartValues) : 0;
    const yAxisMax = chartValues.length ? Math.max(...chartValues) : 0;
    const yAxisPadding = Math.max((yAxisMax - yAxisMin) * 0.18, 6000);
    const yAxisDomain: [number, number] = [
        Math.max(0, Math.floor(yAxisMin - yAxisPadding)),
        Math.ceil(yAxisMax + yAxisPadding),
    ];

    return (
        <DashboardPanel
            title="Revenue"
            aside={
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                    <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary-900" />
                        Current week {formatMoneyCompact(revenueLegend.currentWeekTotal)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-secondary-400" />
                        Last week {formatMoneyCompact(revenueLegend.previousWeekTotal)}
                    </span>
                </div>
            }
        >
            <div className="flex h-full min-h-[360px] flex-col">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueTrend} margin={{ top: 16, right: 12, left: 8, bottom: 16 }}>
                        <CartesianGrid stroke="#eceef2" strokeDasharray="4 4" vertical={false} />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            padding={{ left: 18, right: 12 }}
                            tick={{ fill: '#757677', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                            tickLine={false}
                            domain={yAxisDomain}
                            width={72}
                            tick={{ fill: '#757677', fontSize: 12 }}
                            tickFormatter={(value: number) => `KSh ${(value / 1000).toFixed(value >= 1000000 ? 1 : 0)}k`}
                        />
                        <Tooltip content={<SalesTrendTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="current"
                            name="Current week"
                            stroke="#cc0000"
                            strokeWidth={3}
                            dot={false}
                            isAnimationActive
                            animationDuration={900}
                            animationEasing="ease-out"
                            activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="previous"
                            name="Last week"
                            stroke="#8f8f91"
                            strokeWidth={2.5}
                            strokeDasharray="6 6"
                            dot={false}
                            isAnimationActive
                            animationDuration={900}
                            animationEasing="ease-out"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </DashboardPanel>
    );
}
