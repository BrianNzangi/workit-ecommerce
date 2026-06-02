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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const headerList = await headers();
    const BACKEND_URL = getBackendUrl();

    const res = await fetch(`${BACKEND_URL}/fulfillment/orders/${id}`, {
      headers: {
        'cookie': headerList.get('cookie') || '',
      },
    });

    if (!res.ok) {
      if (res.status === 403) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const order = await res.json();

    let status = 'processing';
    const state = order.state?.toUpperCase();

    if (state === 'PAYMENT_SETTLED' || state === 'COMPLETED') {
      status = 'completed';
    } else if (state === 'SHIPPED') {
      status = 'shipped';
    } else if (state === 'CANCELLED') {
      status = 'cancelled';
    }

    const transformed = {
      id: order.code || order.id,
      backendId: order.id,
      code: order.code,
      state: order.state,
      date_created: order.createdAt,
      status,
      subTotal: order.subTotal?.toLocaleString(),
      shipping: order.shipping?.toLocaleString(),
      tax: order.tax?.toLocaleString(),
      total: order.total?.toLocaleString(),
      totalRaw: order.total,
      subTotalRaw: order.subTotal,
      shippingRaw: order.shipping,
      taxRaw: order.tax,
      currency: order.currencyCode || 'KES',
      customer: order.customer || null,
      shippingAddress: order.shippingAddress || null,
      billingAddress: order.billingAddress || null,
      line_items: (order.lines || []).map((line: any) => ({
        id: line.id,
        name: line.product?.name || line.name || 'Unknown Product',
        quantity: line.quantity,
        price: line.linePrice.toLocaleString(),
        priceRaw: line.linePrice,
        image: line.product?.images?.[0]?.preview || line.product?.images?.[0] || null,
      })),
      payments: order.payments || [],
    };

    return NextResponse.json({ success: true, order: transformed });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
