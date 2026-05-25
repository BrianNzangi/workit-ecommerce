'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { toast } from '@/hooks/use-toast';
import { OrderService } from '@/lib/services/orders/order.service';
import {
    OrdersHeader,
    OrdersToolbar,
    OrdersLoadingState,
    OrdersEmptyState,
    OrdersTable,
} from '@/components/admin/orders';

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

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const service = new OrderService();
            const data = await service.getOrders();
            setOrders(data as unknown as Order[]);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast({
                title: 'Error',
                description: 'Failed to load orders',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        return orders.filter((order) => {
            const matchesSearch =
                !normalizedSearch ||
                order.code.toLowerCase().includes(normalizedSearch) ||
                `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(normalizedSearch) ||
                order.customer.email.toLowerCase().includes(normalizedSearch);
            const matchesStatus = statusFilter === 'all' || order.state === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    const uniqueStatuses = useMemo(() => {
        const statusSet = new Set(orders.map((o) => o.state));
        return Array.from(statusSet).sort();
    }, [orders]);

    const showEmpty = !loading && orders.length === 0;
    const showNoResults = !loading && orders.length > 0 && filteredOrders.length === 0;

    return (
        <ProtectedRoute>
            <AdminLayout>
                <OrdersHeader />

                {loading ? (
                    <OrdersLoadingState />
                ) : showEmpty ? (
                    <OrdersEmptyState />
                ) : (
                    <>
                        <OrdersToolbar
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            statuses={uniqueStatuses}
                            totalCount={orders.length}
                            filteredCount={filteredOrders.length}
                        />

                        {showNoResults ? (
                            <OrdersEmptyState searchTerm={searchTerm} />
                        ) : (
                            <OrdersTable orders={filteredOrders} />
                        )}
                    </>
                )}
            </AdminLayout>
        </ProtectedRoute>
    );
}
