'use client';

import { useQuery } from '@tanstack/react-query';

interface OrderItem {
    name: string;
    quantity: number;
    price: string;
}

interface Order {
    id: string;
    date_created: string;
    status: string;
    total: string;
    currency: string;
    line_items: OrderItem[];
}

interface OrdersResponse {
    success: boolean;
    orders: Order[];
    error?: string;
}

const ORDERS_KEY = ['orders'] as string[];

async function fetchOrders(): Promise<OrdersResponse> {
    const res = await fetch('/api/orders');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch orders');
    return data;
}

export function useOrders() {
    return useQuery({
        queryKey: ORDERS_KEY,
        queryFn: fetchOrders,
        staleTime: 2 * 60 * 1000,
    });
}
