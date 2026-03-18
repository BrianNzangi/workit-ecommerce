import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { DashboardOverviewResponse } from '@/lib/services';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import { DashboardPanel } from './DashboardPanel';
import { formatMoneyCompact } from './dashboard.utils';

interface DashboardMonthlyTargetPanelProps {
    monthlyTarget: DashboardOverviewResponse['monthlyTarget'];
}

export function DashboardMonthlyTargetPanel({ monthlyTarget }: DashboardMonthlyTargetPanelProps) {
    const targetDelta = monthlyTarget.revenue - monthlyTarget.target;
    const todayDelta = monthlyTarget.today - monthlyTarget.revenue / 30;

    const renderTrendArrow = (value: number) =>
        value >= 0 ? <ArrowUpRight className="h-4 w-4 text-emerald-600" /> : <ArrowDownRight className="h-4 w-4 text-rose-600" />;

    return (
        <DashboardPanel title="Monthly Target" subtitle="A simple pulse on where revenue is pacing this month.">
            <div className="mx-auto h-52 w-full max-w-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%"
                        cy="88%"
                        innerRadius="72%"
                        outerRadius="100%"
                        barSize={18}
                        data={[{ name: 'progress', value: monthlyTarget.progress, fill: '#cc0000' }]}
                        startAngle={180}
                        endAngle={0}
                    >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar background dataKey="value" cornerRadius={18} />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>

            <div className="-mt-16 text-center">
                <p className="text-4xl font-semibold tracking-tight text-gray-950">{monthlyTarget.progress.toFixed(1)}%</p>
                <p className="mt-2 text-sm text-gray-500">Progress against a dynamic target derived from real recent sales.</p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 sm:border-b-0 sm:border-r sm:border-gray-100 sm:pb-0 sm:pr-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Target</p>
                        <p className="mt-1 text-lg font-semibold text-gray-950">{formatMoneyCompact(monthlyTarget.target)}</p>
                    </div>
                    {renderTrendArrow(targetDelta)}
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 sm:border-b-0 sm:border-r sm:border-gray-100 sm:pb-0 sm:pr-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Revenue</p>
                        <p className="mt-1 text-lg font-semibold text-gray-950">{formatMoneyCompact(monthlyTarget.revenue)}</p>
                    </div>
                    {renderTrendArrow(targetDelta)}
                </div>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Today</p>
                        <p className="mt-1 text-lg font-semibold text-gray-950">{formatMoneyCompact(monthlyTarget.today)}</p>
                    </div>
                    {renderTrendArrow(todayDelta)}
                </div>
            </div>
        </DashboardPanel>
    );
}
