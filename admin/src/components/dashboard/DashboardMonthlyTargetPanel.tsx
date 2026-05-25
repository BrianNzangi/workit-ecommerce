import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { DashboardOverviewResponse } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
        <Card>
            <CardHeader>
                <CardTitle>Monthly Target</CardTitle>
                <CardDescription>Revenue pacing this month.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 text-center">
                    <p className="text-4xl font-bold">{monthlyTarget.progress.toFixed(1)}%</p>
                    <p className="mt-1 text-sm text-muted-foreground">Progress against target</p>
                </div>

                <Progress value={monthlyTarget.progress} className="mb-6 h-3" />

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Target</p>
                            <p className="text-lg font-semibold">{formatMoneyCompact(monthlyTarget.target)}</p>
                        </div>
                        {renderTrendArrow(targetDelta)}
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                            <p className="text-lg font-semibold">{formatMoneyCompact(monthlyTarget.revenue)}</p>
                        </div>
                        {renderTrendArrow(targetDelta)}
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Today</p>
                            <p className="text-lg font-semibold">{formatMoneyCompact(monthlyTarget.today)}</p>
                        </div>
                        {renderTrendArrow(todayDelta)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
