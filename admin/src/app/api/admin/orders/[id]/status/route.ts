import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/shared/network';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return proxyRequest(request, `/fulfillment/orders/admin/${id}/status`);
}
