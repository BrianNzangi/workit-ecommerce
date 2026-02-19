import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/shared/network';

export async function GET(request: NextRequest) {
    const { search } = new URL(request.url);
    return proxyRequest(request, `/catalog/products/admin/search${search}`);
}
