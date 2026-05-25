import { Globe2 } from 'lucide-react';
import type { DashboardOverviewResponse } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatMoneyCompact } from './dashboard.utils';

interface DashboardSalesByLocationPanelProps {
    locationSales: DashboardOverviewResponse['locationSales'];
}

export function DashboardSalesByLocationPanel({ locationSales }: DashboardSalesByLocationPanelProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales By Location</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-6 flex items-center justify-center rounded-lg bg-muted/50 p-4">
                    <div className="relative flex h-24 w-24 items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/20" />
                        <div className="absolute h-16 w-16 rounded-full border border-primary/20" />
                        <Globe2 className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                </div>

                <div className="space-y-4">
                    {locationSales.map((location) => (
                        <div key={location.city}>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                                <p className="font-medium">{location.city}</p>
                                <span className="text-xs text-muted-foreground">{location.share}%</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Progress value={location.share} className="h-2 flex-1" />
                                <p className="w-20 text-right text-sm font-medium text-muted-foreground">
                                    {formatMoneyCompact(location.amount)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
