'use client';

import { use, useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { InvoiceDisplay } from '@/components/admin/orders/InvoiceDisplay';

interface OrderLine {
    id: string;
    quantity: number;
    linePrice: number;
    variant?: {
        name?: string;
        sku?: string;
        product?: {
            name?: string;
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
    'CANCELLED',
];

export default function InvoiceOnlyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchOrder();
        }
    }, [id]);

    const fetchOrder = async () => {
        try {
            const response = await fetch(`/api/admin/orders/${id}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch order details');
            }

            setOrder(result.order);
        } catch (err) {
            console.error('Error fetching invoice order details:', err);
            setError(err instanceof Error ? err.message : 'Failed to load order');
        } finally {
            setLoading(false);
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
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="text-sm text-red-600">{error || 'Order not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6">
            <InvoiceDisplay
                order={order}
                orderStates={ORDER_STATES}
                updatingStatus={false}
                onStatusUpdate={() => { }}
                onPrint={() => window.print()}
                getStatusColor={getStatusColor}
            />
        </div>
    );
}
