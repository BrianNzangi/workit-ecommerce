'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Order {
    id: string;
    code: string;
    state: string;
    total: number;
    createdAt: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export function OrdersList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/internal-orders');
            const text = await response.text();
            console.log('[OrdersList] Raw response:', text);

            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('[OrdersList] JSON parse error:', e);
                throw new Error('Server returned invalid data format (HTML instead of JSON)');
            }

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch orders');
            }

            setOrders(result.orders || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err instanceof Error ? err.message : 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (cents: number) => {
        return `KES ${(cents / 100).toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (state: string) => {
        const colors: Record<string, string> = {
            CREATED: 'bg-gray-100 text-gray-800',
            PAYMENT_PENDING: 'bg-yellow-100 text-yellow-800',
            PAYMENT_AUTHORIZED: 'bg-blue-100 text-blue-800',
            PAYMENT_SETTLED: 'bg-green-100 text-green-800',
            SHIPPED: 'bg-indigo-100 text-indigo-800',
            DELIVERED: 'bg-emerald-100 text-emerald-800',
            CANCELLED: 'bg-red-100 text-red-800',
        };
        return colors[state] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    <span className="ml-3 text-gray-600">Loading orders...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600">Orders will appear here when customers make purchases</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Link
                                    href={`/admin/orders/${order.id}`}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-900"
                                >
                                    {order.code}
                                </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {order.customer.firstName} {order.customer.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{order.customer.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.state)}`}>
                                    {order.state.replace(/_/g, ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(order.total)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
