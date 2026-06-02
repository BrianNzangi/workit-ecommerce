'use client';

import { useEffect, useState, use } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { toast } from '@/hooks/use-toast';
import { InvoiceDisplay } from '@/components/admin/orders/InvoiceDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCookieValue } from '@/lib/auth/csrf';

interface OrderLine {
    id: string;
    quantity: number;
    linePrice: number;
    product?: {
        name?: string;
    } | null;
}

interface Order {
    id: string;
    code: string;
    state: string;
    total: number;
    subTotal: number;
    shipping: number;
    tax: number;
    createdAt: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
    };
    shippingAddress: {
        streetLine1: string;
        streetLine2: string;
        city: string;
        province: string;
        phoneNumber: string;
    } | null;
    lines: OrderLine[];
}

const ORDER_STATES = [
    'CREATED',
    'PAYMENT_PENDING',
    'PAYMENT_AUTHORIZED',
    'PAYMENT_SETTLED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
];

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (id) {
            fetchOrderDetails();
        }
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const response = await fetch(`/api/admin/orders/${id}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch order details');
            }

            setOrder(result.order);
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError(err instanceof Error ? err.message : 'Failed to load order');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newState: string) => {
        if (!order) return;

        setUpdatingStatus(true);
        try {
            const csrfToken = getCookieValue('XSRF-TOKEN');
            const response = await fetch(`/api/admin/orders/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { 'x-xsrf-token': csrfToken } : {}),
                },
                body: JSON.stringify({ state: newState })
            });

            const result = await response.json();

            if (result.success) {
                setOrder({ ...order, state: newState });
                toast({
                    title: 'Success',
                    description: `Order status updated to ${newState.replace(/_/g, ' ')}`,
                    variant: 'success'
                });
            } else {
                throw new Error(result.error || 'Failed to update status');
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: err instanceof Error ? err.message : 'Failed to update status',
                variant: 'error'
            });
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getStatusColor = (state: string) => {
        const colors: Record<string, string> = {
            CREATED: 'bg-gray-100 text-gray-800',
            PAYMENT_PENDING: 'bg-yellow-50 text-yellow-700',
            PAYMENT_AUTHORIZED: 'bg-blue-50 text-blue-700',
            PAYMENT_SETTLED: 'bg-emerald-50 text-emerald-700',
            SHIPPED: 'bg-indigo-50 text-indigo-700',
            DELIVERED: 'bg-gray-900 text-white',
            CANCELLED: 'bg-red-50 text-red-700',
        };
        return colors[state] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <Loader2 className="w-8 h-8 text-primary-700 animate-spin mb-3" />
                        <p className="text-gray-600 text-sm">Loading order details...</p>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    if (error || !order) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <Card className="max-w-md mx-auto rounded border border-gray-200">
                        <CardContent className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Order</h2>
                            <p className="text-sm text-gray-600 mb-6">{error || 'Order not found'}</p>
                            <Button asChild variant="outline" className="rounded">
                                <Link href="/admin/orders">
                                    Back to Orders
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <InvoiceDisplay
                    order={order}
                    orderStates={ORDER_STATES}
                    updatingStatus={updatingStatus}
                    onStatusUpdate={handleStatusUpdate}
                    getStatusColor={getStatusColor}
                />
            </AdminLayout>
        </ProtectedRoute>
    );
}
