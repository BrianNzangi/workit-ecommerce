import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

const getBackendUrl = () => {
  const env = process.env as Record<string, string | undefined>;
  return (
    env.BACKEND_API_URL ||
    env.BACKEND_URL ||
    env.NEXT_PUBLIC_BACKEND_URL ||
    env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:3001'
  ).replace(/\/$/, '');
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        success: true,
        orders: [],
        total: 0,
      });
    }

    const headerList = await headers();
    const BACKEND_URL = getBackendUrl();

    const res = await fetch(`${BACKEND_URL}/fulfillment/orders`, {
      headers: {
        'cookie': headerList.get('cookie') || '',
      },
    });

    if (!res.ok) {
      console.warn(`Backend orders API returned ${res.status}; returning empty orders`);
      return NextResponse.json({
        success: true,
        orders: [],
        total: 0,
      });
    }

    const data = await res.json();
    const backendOrders = data.orders || [];

    const transformedOrders = backendOrders.map((order: any) => {
      let status = 'processing';
      const state = order.state?.toUpperCase();

      if (state === 'PAYMENT_SETTLED' || state === 'COMPLETED') {
        status = 'completed';
      } else if (state === 'SHIPPED') {
        status = 'shipped';
      } else if (state === 'CANCELLED') {
        status = 'cancelled';
      }

      return {
        id: order.code || order.id,
        backendId: order.id,
        date_created: order.createdAt,
        status: status,
        total: order.total.toLocaleString(),
        currency: order.currencyCode || 'KES',
        line_items: (order.lines || []).map((line: any) => ({
          name: line.product?.name || 'Unknown Product',
          quantity: line.quantity,
          price: line.linePrice.toLocaleString(),
        })),
      };
    });

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      total: transformedOrders.length,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({
      success: true,
      orders: [],
      total: 0,
    });
  }
}
