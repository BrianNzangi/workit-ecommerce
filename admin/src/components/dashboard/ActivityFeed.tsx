import { Package, AlertTriangle, UserPlus, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { DashboardOverviewResponse } from '@/lib/services';

interface ActivityFeedProps {
    lowStockProducts: number;
    outOfStock: number;
    totalCustomers: number;
    recentOrders: DashboardOverviewResponse['recentOrders'];
}

export function ActivityFeed({ lowStockProducts, outOfStock, totalCustomers, recentOrders }: ActivityFeedProps) {
    const pendingOrders = recentOrders.filter(
        (o) => o.state !== 'DELIVERED' && o.state !== 'CANCELLED'
    ).length;

    const activities = [
        {
            icon: AlertTriangle,
            title: 'Low Stock Alert',
            description: `${lowStockProducts} products running low on inventory`,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
        },
        {
            icon: Package,
            title: 'Out of Stock',
            description: `${outOfStock} products currently unavailable`,
            color: 'text-red-600',
            bg: 'bg-red-100',
        },
        {
            icon: UserPlus,
            title: 'Customer Base',
            description: `${totalCustomers.toLocaleString()} total registered customers`,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            icon: ShoppingCart,
            title: 'Pending Orders',
            description: `${pendingOrders} orders awaiting fulfillment`,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>Quick overview of current store status</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {activities.map((activity) => (
                        <div key={activity.title} className="flex items-start gap-3 rounded-lg border p-4">
                            <div className={`rounded-md p-2 ${activity.bg}`}>
                                <activity.icon className={`h-4 w-4 ${activity.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{activity.title}</p>
                                <p className="text-xs text-muted-foreground">{activity.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
