import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatPercent } from './dashboard.utils';

interface DashboardStatCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
    helper: string;
    accent: string;
    change?: number;
}

export function DashboardStatCard({ icon: Icon, label, value, helper, accent, change }: DashboardStatCardProps) {
    const positive = (change || 0) >= 0;

    return (
        <div className="h-full rounded-lg border border-gray-200 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(6,7,9,0.35)]">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${accent}`}>
                    <Icon className="h-5 w-5" />
                </div>
                {typeof change === 'number' ? (
                    <div
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                    >
                        {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {formatPercent(change)}
                    </div>
                ) : null}
            </div>

            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">{value}</p>
            <p className="mt-3 text-sm text-gray-500">{helper}</p>
        </div>
    );
}
