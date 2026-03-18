import { format } from 'date-fns';
import type { DashboardOverviewResponse } from '@/lib/services';
import { Badge } from '@/components/ui/Badge';
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
        <div className="flex h-full flex-col overflow-hidden rounded-lg">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                    <h2 className="text-xl font-semibold text-gray-950">Recent Orders</h2>
                    <p className="mt-1 text-sm text-gray-500">Latest customer activity flowing into the admin console.</p>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80">
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Order ID</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Customer</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-gray-100" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-gray-100" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-gray-100" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-gray-100" /></td>
                                    <td className="px-6 py-4"><div className="h-6 w-20 rounded-full bg-gray-100" /></td>
                                </tr>
                            ))
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No recent orders to display
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="transition-colors hover:bg-gray-50/80">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-950">#{order.code}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{order.customerName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {format(new Date(order.createdAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatMoney(order.total)}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusColor(order.state)}>
                                            {formatOrderState(order.state)}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
