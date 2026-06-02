'use client';

import { useQuery } from '@tanstack/react-query';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: string;
  priceRaw: number;
  image: string | null;
}

interface OrderAddress {
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  phoneNumber: string;
}

interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
}

interface Order {
  id: string;
  backendId: string;
  code: string;
  state: string;
  date_created: string;
  status: string;
  subTotal: string;
  shipping: string;
  tax: string;
  total: string;
  totalRaw: number;
  subTotalRaw: number;
  shippingRaw: number;
  taxRaw: number;
  currency: string;
  customer: OrderCustomer | null;
  shippingAddress: OrderAddress | null;
  billingAddress: OrderAddress | null;
  line_items: OrderItem[];
  payments: any[];
}

interface OrderResponse {
  success: boolean;
  order?: Order;
  error?: string;
}

async function fetchOrder(id: string): Promise<OrderResponse> {
  try {
    const res = await fetch(`/api/orders/${id}`);
    const data = await res.json();
    return data;
  } catch {
    return { success: false, error: 'Failed to fetch order' };
  }
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}
