// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getWooCommerceCustomerByEmail, getWooCommerceOrdersByCustomer } from '@/lib/woocommerce';

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    // Get WooCommerce customer by email
    const customer = await getWooCommerceCustomerByEmail(user.primaryEmailAddress?.emailAddress || '');

    if (!customer) {
      // No customer found, return empty orders
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    // Fetch orders for this customer
    const wcOrders = await getWooCommerceOrdersByCustomer(customer.id);

    // Transform WooCommerce orders to match the expected format
    const orders = wcOrders.map((order: any) => ({
      id: order.id.toString(),
      date_created: order.date_created,
      status: order.status,
      total: order.total,
      currency: order.currency,
      line_items: order.line_items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders',
    }, { status: 500 });
  }
}
