import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/shared/network';

export async function GET(request: NextRequest) {
    const { search } = request.nextUrl;
    return proxyRequest(request, `/fulfillment/shipping/admin/zones${search}`);
}

export async function POST(request: NextRequest) {
    return proxyRequest(request, '/fulfillment/shipping/admin/zones');
}
