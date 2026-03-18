import { Globe2 } from 'lucide-react';
import type { DashboardOverviewResponse } from '@/lib/services';
import { DashboardPanel } from './DashboardPanel';
import { formatMoneyCompact } from './dashboard.utils';

interface DashboardSalesByLocationPanelProps {
    locationSales: DashboardOverviewResponse['locationSales'];
}

export function DashboardSalesByLocationPanel({ locationSales }: DashboardSalesByLocationPanelProps) {
    return (
        <DashboardPanel title="Sales By Location">
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-lg bg-[radial-gradient(circle_at_center,_rgba(204,0,0,0.08),_transparent_60%)]">
                    <div className="absolute inset-4 rounded-full border border-dashed border-gray-200" />
                    <div className="absolute h-20 w-20 rounded-full border border-primary-200/80" />
                    <div className="absolute h-28 w-28 rounded-full border border-gray-200" />
                    <Globe2 className="h-12 w-12 text-gray-300" />
                    <span className="absolute left-[44%] top-[48%] h-3 w-3 rounded-full bg-primary-900 ring-4 ring-primary-100" />
                    <span className="absolute left-[36%] top-[55%] h-2.5 w-2.5 rounded-full bg-primary-700 ring-4 ring-primary-50" />
                    <span className="absolute left-[52%] top-[58%] h-2.5 w-2.5 rounded-full bg-secondary-900 ring-4 ring-white" />
                </div>
            </div>

            <div className="space-y-4">
                {locationSales.map((location) => (
                    <div key={location.city}>
                        <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                            <p className="font-medium text-gray-900">{location.city}</p>
                            <p className="font-medium text-gray-500">{formatMoneyCompact(location.amount)}</p>
                            <span className="text-xs font-semibold text-gray-500">{location.share}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary-900 via-primary-700 to-primary-400"
                                style={{ width: `${location.share}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </DashboardPanel>
    );
}
