import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/shared/network';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return proxyRequest(request, `/fulfillment/orders/admin/${id}`);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    // Map PATCH to PUT on backend for order status/updates if status endpoint not separate
    return proxyRequest(request, `/fulfillment/orders/admin/${id}`);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return proxyRequest(request, `/fulfillment/orders/admin/${id}`);
}
