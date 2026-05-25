import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { DashboardOverviewResponse } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatMoney, formatMoneyCompact, salesMixColors } from './dashboard.utils';

interface DashboardSalesMixPanelProps {
    salesMix: DashboardOverviewResponse['salesMix'];
}

export function DashboardSalesMixPanel({ salesMix }: DashboardSalesMixPanelProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Total Sales</CardTitle>
                <CardDescription>Real order-state mix in KES.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mx-auto h-40 w-full max-w-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={salesMix.map((s) => ({ ...s }))}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={44}
                                outerRadius={68}
                                paddingAngle={2}
                                strokeWidth={0}
                            >
                                {salesMix.map((entry, index) => (
                                    <Cell key={entry.name} fill={salesMixColors[index % salesMixColors.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, _name, entry) => [
                                    `${Number(value || 0)}% • ${formatMoney((entry?.payload as { amount?: number } | undefined)?.amount || 0)}`,
                                    (entry?.payload as { name?: string } | undefined)?.name || 'Segment',
                                ]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 space-y-2">
                    {salesMix.map((segment, index) => (
                        <div key={segment.name} className="flex items-center justify-between text-sm">
                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: salesMixColors[index % salesMixColors.length] }} />
                                {segment.name}
                            </span>
                            <span className="font-medium">{formatMoneyCompact(segment.amount)}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
