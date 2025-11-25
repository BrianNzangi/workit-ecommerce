// src/app/api/orders/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { vendureClient } from '@/lib/vendure-client';
import {
  ADD_TO_CART,
  SET_SHIPPING_ADDRESS,
  SET_SHIPPING_METHOD,
  ADD_PAYMENT,
} from '@/lib/vendure-queries';

export async function POST(request: NextRequest) {
  try {
    const { items, billing, shipping, payment } = await request.json();

    // Step 1: Add items to cart (create order)
    for (const item of items) {
      const { data: addItemData } = await vendureClient.mutate({
        mutation: ADD_TO_CART,
        variables: {
          productVariantId: item.variantId || item.id,
          quantity: item.quantity,
        },
      }) as { data: any };

      if (addItemData.addItemToOrder.__typename !== 'Order') {
        throw new Error(addItemData.addItemToOrder.message || 'Failed to add item to cart');
      }
    }

    // Step 2: Set shipping address
    const shippingAddressInput = {
      fullName: `${shipping.first_name} ${shipping.last_name}`,
      streetLine1: shipping.address_1,
      streetLine2: shipping.address_2 || '',
      city: shipping.city,
      province: shipping.county || shipping.state,
      postalCode: shipping.postcode,
      country: shipping.country || 'KE',
      phoneNumber: billing.phone,
    };

    const { data: addressData } = await vendureClient.mutate({
      mutation: SET_SHIPPING_ADDRESS,
      variables: {
        input: shippingAddressInput,
      },
    }) as { data: any };

    if (addressData.setOrderShippingAddress.__typename !== 'Order') {
      throw new Error('Failed to set shipping address');
    }

    // Step 3: Set shipping method (use first available method)
    // Note: You may want to fetch eligible shipping methods first and let user choose
    const { data: shippingMethodData } = await vendureClient.mutate({
      mutation: SET_SHIPPING_METHOD,
      variables: {
        shippingMethodId: ['1'], // Default shipping method ID - adjust as needed
      },
    }) as { data: any };

    if (shippingMethodData.setOrderShippingMethod.__typename !== 'Order') {
      throw new Error('Failed to set shipping method');
    }

    // Step 4: Add payment
    const paymentInput = {
      method: 'paystack', // Assuming Paystack payment handler is configured in Vendure
      metadata: {
        paymentMethod: payment.method, // mpesa, airtel, card
        email: billing.email,
        phone: billing.phone,
      },
    };

    const { data: paymentData } = await vendureClient.mutate({
      mutation: ADD_PAYMENT,
      variables: {
        input: paymentInput,
      },
    }) as { data: any };

    if (paymentData.addPaymentToOrder.__typename !== 'Order') {
      throw new Error(paymentData.addPaymentToOrder.message || 'Failed to add payment');
    }

    const order = paymentData.addPaymentToOrder;

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        code: order.code,
        total: (order.totalWithTax / 100).toString(),
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
