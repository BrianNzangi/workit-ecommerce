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

    // TODO: Implement actual order fetching from the new backend
    // For now, return an empty list to replace Vendure implementation
    const orders: any[] = [];

    return NextResponse.json({
      success: true,
      orders,
      total: 0,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders',
    }, { status: 500 });
  }
}
