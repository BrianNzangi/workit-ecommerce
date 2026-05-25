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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMoneyCompact } from './dashboard.utils';

function SalesTrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
            <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
            <div className="space-y-1 text-sm">
                {payload.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">{entry.name}</span>
                        <span className="font-medium">KSh {Math.round(entry.value).toLocaleString()}</span>
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
        <Card>
            <CardHeader>
                <CardTitle>Revenue</CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Current week {formatMoneyCompact(revenueLegend.currentWeekTotal)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                        Last week {formatMoneyCompact(revenueLegend.previousWeekTotal)}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                            <XAxis
                                dataKey="label"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                domain={yAxisDomain}
                                width={64}
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                tickFormatter={(value: number) => `KSh ${(value / 1000).toFixed(value >= 1000000 ? 1 : 0)}k`}
                            />
                            <Tooltip content={<SalesTrendTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="current"
                                name="Current week"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="previous"
                                name="Last week"
                                stroke="hsl(var(--muted-foreground))"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
