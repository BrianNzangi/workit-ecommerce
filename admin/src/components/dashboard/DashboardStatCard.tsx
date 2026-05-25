import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPercent } from './dashboard.utils';

interface DashboardStatCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
    helper?: string;
    change?: number;
}

export function DashboardStatCard({ icon: Icon, label, value, helper, change }: DashboardStatCardProps) {
    const positive = (change || 0) >= 0;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {typeof change === 'number' && (
                        <div
                            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                                positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}
                        >
                            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {formatPercent(change)}
                        </div>
                    )}
                </div>
                <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
                    {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
