// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { vendureClient } from '@/lib/vendure-client';
import { GET_CUSTOMER_ORDERS } from '@/lib/vendure-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');

    const skip = (page - 1) * perPage;

    const { data } = await vendureClient.query({
      query: GET_CUSTOMER_ORDERS,
      variables: {
        options: {
          take: perPage,
          skip,
        },
      },
    }) as { data: any };

    if (!data.activeCustomer) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        orders: [],
      }, { status: 401 });
    }

    const orders = data.activeCustomer.orders.items.map((order: any) => ({
      id: order.id,
      order_key: order.code,
      status: order.state.toLowerCase(),
      total: (order.totalWithTax / 100).toString(),
      currency: order.currencyCode,
      date_created: order.createdAt,
      line_items: order.lines.map((line: any) => ({
        name: line.productVariant.product.name,
        quantity: line.quantity,
        image: line.productVariant.product.featuredAsset?.preview,
      })),
    }));

    return NextResponse.json({
      success: true,
      orders,
      total: data.activeCustomer.orders.totalItems,
    });
  } catch (error) {
    console.error('Error fetching orders from Vendure:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders',
    }, { status: 500 });
  }
}
