import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/shared/network';

export async function DELETE(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    // Replace /api/admin/assets with /catalog/assets/admin
    // This handles the ID automatically since it's part of the pathname suffix
    const backendPath = pathname.replace('/api/admin/assets', '/catalog/assets/admin');
    return proxyRequest(request, backendPath + search);
}
