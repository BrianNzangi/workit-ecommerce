import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/shared/network';

export async function GET(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const backendPath = pathname.replace('/api/admin/collections', '/catalog/collections/admin');
    return proxyRequest(request, backendPath + search);
}

export async function PATCH(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const backendPath = pathname.replace('/api/admin/collections', '/catalog/collections/admin');
    return proxyRequest(request, backendPath + search);
}

export async function DELETE(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const backendPath = pathname.replace('/api/admin/collections', '/catalog/collections/admin');
    return proxyRequest(request, backendPath + search);
}
