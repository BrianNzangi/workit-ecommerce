import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    const { user } = session;

    const body = await request.json();
    const { customer, items, billing, shipping, payment, totals, coupon } = body;

    // Validate required fields
    if (!billing || !items || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required order data',
      }, { status: 400 });
    }

    // STEP 1: Validate cart items before creating order
    // Use the updated backend endpoint /store/cart/validate
    console.log('Validating cart items...');
    const validationResponse = await fetch(`${BACKEND_URL}/store/cart/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!validationResponse.ok) {
      const errorText = await validationResponse.text();
      console.error('Validation API error:', errorText);
      return NextResponse.json({
        success: false,
        error: 'Failed to validate cart. Please try again.'
      }, { status: validationResponse.status });
    }

    const validationResult = await validationResponse.json();

    if (!validationResult.valid) {
      console.error('Cart validation failed:', validationResult);
      const invalidItems = validationResult.invalidItems || [];
      if (invalidItems.length > 0) {
        const errorMessages = invalidItems.map((item: any) =>
          `• ${item.item?.name || 'Unknown product'}: ${item.reason}`
        ).join('\n');

        return NextResponse.json({
          success: false,
          error: `Some items in your cart are no longer available:\n\n${errorMessages}\n\nPlease remove these items and try again.`,
          invalidItems,
        }, { status: 400 });
      }
    }

    console.log('✅ Cart validation passed');

    // STEP 2: Prepare data for the REST checkout endpoint
    const checkoutInput = {
      customerId: user.id || customer?.id,
      customerEmail: billing.email,
      customerName: `${billing.first_name} ${billing.last_name}`.trim(),
      customerPhone: billing.phone || '',
      shippingAddress: {
        fullName: `${billing.first_name} ${billing.last_name}`.trim(),
        streetLine1: shipping?.address_1 || billing.address_1,
        streetLine2: shipping?.address_2 || billing.address_2 || '',
        city: shipping?.city || billing.city,
        province: shipping?.county || billing.county,
        postalCode: shipping?.postcode || billing.postcode || '',
        phoneNumber: billing.phone || '',
      },
      billingAddress: {
        fullName: `${billing.first_name} ${billing.last_name}`.trim(),
        streetLine1: billing.address_1,
        streetLine2: billing.address_2 || '',
        city: billing.city,
        province: billing.county,
        postalCode: billing.postcode || '',
        phoneNumber: billing.phone || '',
      },
      items: items.map((item: any) => ({
        productId: item.productId || item.id,
        quantity: parseInt(String(item.quantity), 10) || 1,
        price: parseFloat(String(item.price)) || 0,
      })),
      shippingMethodId: shipping?.method || 'standard',
      shippingCost: totals?.shipping || 0,
    };

    console.log('Final checkout input:', JSON.stringify(checkoutInput, null, 2));

    // STEP 3: Call backend REST API
    const response = await fetch(`${BACKEND_URL}/store/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutInput),
    });

    if (!response.ok) {
      const errorResult = await response.json().catch(() => ({ message: 'Checkout failed' }));
      console.error('Backend checkout error:', errorResult);
      return NextResponse.json({
        success: false,
        error: errorResult.message || 'Failed to create order on server',
      }, { status: response.status });
    }

    const orderData = await response.json();

    return NextResponse.json({
      success: true,
      order: {
        id: orderData.orderId,
        code: orderData.orderCode,
        total: orderData.total,
      },
    });
  } catch (error: any) {
    console.error('Error creating order:', error.message || error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create order',
    }, { status: 500 });
  }
}
