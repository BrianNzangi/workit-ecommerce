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
    try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        return { success: true, orders: data.orders || [] };
    } catch {
        return { success: true, orders: [] };
    }
}

export function useOrders() {
    return useQuery({
        queryKey: ORDERS_KEY,
        queryFn: fetchOrders,
        staleTime: 0,
        refetchInterval: 15 * 1000,
        refetchOnWindowFocus: true,
    });
}
