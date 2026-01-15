'use client';

import { useEffect, useState, use } from 'react';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { toast } from '@/hooks/use-toast';
import { InvoiceDisplay } from '@/components/admin/orders/InvoiceDisplay';

interface OrderLine {
    id: string;
    quantity: number;
    linePrice: number;
    variant: {
        name: string;
        sku: string;
        product: {
            name: string;
        };
    };
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
            const response = await fetch(`/api/internal-orders/${id}`);
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
            const response = await fetch(`/api/internal-orders/${id}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    const handlePrint = () => {
        window.print();
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
                        <Loader2 className="w-12 h-12 text-[#FF5023] animate-spin mb-4" />
                        <p className="text-gray-600 font-medium font-sans">Loading order details...</p>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    if (error || !order) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-200 text-center font-sans">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Order</h2>
                        <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
                        <Link
                            href="/admin/orders"
                            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
                        </Link>
                    </div>
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
                    onPrint={handlePrint}
                    getStatusColor={getStatusColor}
                />
            </AdminLayout>
        </ProtectedRoute>
    );
}
