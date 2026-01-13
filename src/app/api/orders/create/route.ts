import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

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

    // TODO: Implement order creation on new backend
    // const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // await fetch(`${backendUrl}/api/store/orders`, { method: 'POST', body: JSON.stringify(body) ... });

    return NextResponse.json({
      success: true,
      order: {
        code: 'MOCK-ORDER-' + Date.now(),
        id: 'mock-id',
        total: 0
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create order',
    }, { status: 500 });
  }
}
