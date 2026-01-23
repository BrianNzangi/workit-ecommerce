import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

export async function GET(request: NextRequest) {
  try {
    const { user } = await withAuth();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        orders: [],
      }, { status: 401 });
    }

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

    // Fetch orders from the new backend by user's email
    console.log(`Fetching orders for ${user.email} from backend...`);
    const res = await fetch(`${BACKEND_URL}/store/orders/by-email/${user.email}`);

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    const data = await res.json();
    const backendOrders = data.orders || [];

    // Map backend orders to the format expected by the frontend UI
    const transformedOrders = backendOrders.map((order: any) => {
      // Map backend states to UI statuses
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
        date_created: order.createdAt,
        status: status,
        total: order.total.toLocaleString(),
        currency: order.currencyCode || 'KES',
        line_items: (order.lines || []).map((line: any) => ({
          name: line.name || 'Unknown Product',
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
      success: false,
      error: 'Failed to fetch orders',
    }, { status: 500 });
  }
}
