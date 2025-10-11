// src/app/api/orders/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateWooCommerceCustomer } from '@/lib/woocommerce';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { items, billing, shipping, payment } = await request.json();

    let customerId = null;

    // If user is authenticated, sync with WooCommerce
    if (userId) {
      try {
        const customer = await getOrCreateWooCommerceCustomer(userId, {
          email: billing.email,
          firstName: billing.first_name,
          lastName: billing.last_name,
          phone: billing.phone,
        });
        customerId = customer.id;
      } catch (error) {
        console.warn('Failed to sync customer with WooCommerce:', error);
        // Continue with guest order if customer sync fails
      }
    }

    // Create order in WooCommerce
    const orderData = {
      payment_method: payment.method,
      payment_method_title: getPaymentMethodTitle(payment.method),
      set_paid: false,
      billing: {
        first_name: billing.first_name,
        last_name: billing.last_name,
        address_1: billing.address_1,
        city: billing.city,
        state: billing.county,
        postcode: billing.postcode,
        country: billing.country,
        email: billing.email,
        phone: billing.phone,
      },
      shipping: {
        first_name: shipping.first_name,
        last_name: shipping.last_name,
        address_1: shipping.address_1,
        city: shipping.city,
        state: shipping.county,
        postcode: shipping.postcode,
        country: shipping.country,
      },
      line_items: items.map((item: any) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
      ...(customerId && { customer_id: customerId }),
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
      },
      body: JSON.stringify(orderData),
    });

    const order = await response.json();

    if (!response.ok) {
      throw new Error(order.message || 'Failed to create order');
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id.toString(),
        total: order.total,
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order',
    }, { status: 500 });
  }
}

function getPaymentMethodTitle(method: string): string {
  switch (method) {
    case 'mpesa':
      return 'M-Pesa';
    case 'airtel':
      return 'Airtel Money';
    case 'card':
      return 'Credit/Debit Card (Paystack)';
    default:
      return method;
  }
}
