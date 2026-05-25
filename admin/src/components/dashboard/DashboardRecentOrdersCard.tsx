import { format } from 'date-fns';
import type { DashboardOverviewResponse } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney, formatOrderState } from './dashboard.utils';

interface DashboardRecentOrdersCardProps {
    orders: DashboardOverviewResponse['recentOrders'];
    loading: boolean;
}

function getStatusColor(status: string) {
    switch (status) {
        case 'DELIVERED':
            return 'success';
        case 'SHIPPED':
            return 'info';
        case 'PAYMENT_SETTLED':
            return 'default';
        case 'CANCELLED':
            return 'error';
        default:
            return 'warning';
    }
}

export function DashboardRecentOrdersCard({ orders, loading }: DashboardRecentOrdersCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer activity flowing into the admin console.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No recent orders to display
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.code}</TableCell>
                                    <TableCell>{order.customerName}</TableCell>
                                    <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="font-semibold">{formatMoney(order.total)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(order.state)}>
                                            {formatOrderState(order.state)}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
