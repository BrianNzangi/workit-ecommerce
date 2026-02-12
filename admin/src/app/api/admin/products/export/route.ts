import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/shared/network';

export async function GET(request: NextRequest) {
    return proxyRequest(request, '/catalog/products/admin/export');
}
