import { ShoppingCart, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { Order } from './types';

interface OrdersStatsProps {
    orders: Order[];
}

export function OrdersStats({ orders }: OrdersStatsProps) {
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => ['DELIVERED', 'SHIPPED'].includes(o.state)).length;
    const pendingOrders = orders.filter((o) => ['CREATED', 'PAYMENT_PENDING', 'PAYMENT_AUTHORIZED'].includes(o.state)).length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const stats = [
        {
            label: 'Total Orders',
            value: totalOrders,
            icon: ShoppingCart,
            color: 'text-primary-700',
            bgColor: 'bg-primary-50',
        },
        {
            label: 'Completed',
            value: completedOrders,
            icon: CheckCircle2,
            color: 'text-green-700',
            bgColor: 'bg-green-50',
        },
        {
            label: 'Pending',
            value: pendingOrders,
            icon: Clock,
            color: 'text-amber-700',
            bgColor: 'bg-amber-50',
        },
        {
            label: 'Revenue',
            value: `KES ${(totalRevenue / 1000).toFixed(1)}k`,
            icon: DollarSign,
            color: 'text-emerald-700',
            bgColor: 'bg-emerald-50',
        },
    ];

    return (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <div key={stat.label} className="rounded bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold tracking-tight text-gray-900">{stat.value}</p>
                            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
