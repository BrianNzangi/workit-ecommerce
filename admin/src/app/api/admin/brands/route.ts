import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/shared/network';

export async function GET(request: NextRequest) {
    const { search } = new URL(request.url);
    return proxyRequest(request, `/catalog/brands/admin${search}`);
}

export async function POST(request: NextRequest) {
    return proxyRequest(request, '/catalog/brands/admin');
}
