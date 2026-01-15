import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const { user } = await withAuth();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    const body = await request.json();
    const { customer, items, billing, shipping, payment, totals, coupon } = body;

    // Validate required fields
    if (!billing || !items || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required order data',
      }, { status: 400 });
    }

    // Debug: Log items to see their structure
    console.log('Cart items:', JSON.stringify(items, null, 2));

    // STEP 1: Validate cart items before creating order
    console.log('Validating cart items...');
    const validationResponse = await fetch(`${BACKEND_URL}/api/store/cart/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    const validationResult = await validationResponse.json();

    if (!validationResult.success || !validationResult.data.valid) {
      console.error('Cart validation failed:', validationResult);

      const invalidItems = validationResult.data?.invalidItems || [];
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

    // Prepare line items for GraphQL mutation
    const lineItems = items.map((item: any) => {
      // Strictly use variantId - NEVER fall back to productId (item.id)
      let variantId = item.variantId;

      // Guard: Ensure variantId is valid and NOT equal to productId
      if (!variantId || variantId === item.id || variantId === "NaN" || variantId === "0") {
        console.error('❌ Invalid variantId for item:', {
          name: item.name,
          productId: item.id,
          variantId: item.variantId
        });
        throw new Error(`Product "${item.name}" has an invalid configuration. Please remove it from cart and re-add it.`);
      }

      return {
        variantId: String(variantId),
        quantity: parseInt(String(item.quantity), 10) || 1,
      };
    });

    console.log('Prepared line items:', JSON.stringify(lineItems, null, 2));

    // Prepare complete order input according to CreateOrderInput schema
    const orderInput: any = {
      email: billing.email,
      firstName: billing.first_name,
      lastName: billing.last_name,
      shippingAddress: {
        fullName: `${billing.first_name} ${billing.last_name}`.trim(),
        streetLine1: shipping?.address_1 || billing.address_1,
        streetLine2: shipping?.address_2 || billing.address_2 || '',
        city: shipping?.city || billing.city,
        province: shipping?.county || billing.county,
        postalCode: shipping?.postcode || billing.postcode || '',
        phoneNumber: billing.phone || '',
        country: 'KE',
      },
      billingAddress: {
        fullName: `${billing.first_name} ${billing.last_name}`.trim(),
        streetLine1: billing.address_1,
        streetLine2: billing.address_2 || '',
        city: billing.city,
        province: billing.county,
        postalCode: billing.postcode || '',
        phoneNumber: billing.phone || '',
        country: 'KE',
      },
      lines: lineItems,
    };

    // Add optional fields only if they exist in schema
    if (totals?.shipping > 0) {
      orderInput.shippingMethodId = 'standard';
    }

    if (coupon) {
      orderInput.couponCode = typeof coupon === 'string' ? coupon : coupon.code;
    }

    console.log('Final order input (filtered):', JSON.stringify(orderInput, null, 2));

    // GraphQL mutation to create order
    const mutation = `
      mutation CreateOrder($input: CreateOrderInput!) {
        createOrder(input: $input) {
          id
          code
          total
        }
      }
    `;

    // Call backend GraphQL API
    const response = await fetch(`${BACKEND_URL}/api/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: { input: orderInput },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json({
        success: false,
        error: result.errors[0]?.message || 'Failed to create order',
      }, { status: 500 });
    }

    if (!result.data?.createOrder) {
      return NextResponse.json({
        success: false,
        error: 'Order creation failed',
      }, { status: 500 });
    }

    const order = result.data.createOrder;

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        code: order.code,
        total: order.total,
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
