import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { DashboardOverviewResponse } from '@/lib/services';
import { DashboardPanel } from './DashboardPanel';
import { formatMoney, formatMoneyCompact, salesMixColors } from './dashboard.utils';

interface DashboardSalesMixPanelProps {
    salesMix: DashboardOverviewResponse['salesMix'];
}

export function DashboardSalesMixPanel({ salesMix }: DashboardSalesMixPanelProps) {
    return (
        <DashboardPanel title="Total Sales" subtitle="Real order-state mix in KES.">
            <div className="mx-auto h-44 w-full max-w-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={salesMix.map((entry, index) => ({ ...entry, color: salesMixColors[index % salesMixColors.length] }))}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={48}
                            outerRadius={72}
                            paddingAngle={3}
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

            <div className="space-y-3">
                {salesMix.map((segment, index) => (
                    <div key={segment.name} className="flex items-center justify-between gap-3 text-sm">
                        <span className="inline-flex items-center gap-2 text-gray-600">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: salesMixColors[index % salesMixColors.length] }} />
                            {segment.name}
                        </span>
                        <span className="font-medium text-gray-950">{formatMoneyCompact(segment.amount)}</span>
                    </div>
                ))}
            </div>
        </DashboardPanel>
    );
}
