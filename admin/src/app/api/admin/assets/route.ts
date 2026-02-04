import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/shared/network';

export async function GET(request: NextRequest) {
    const { search } = new URL(request.url);
    return proxyRequest(request, `/catalog/assets/admin${search}`);
}

export async function POST(request: NextRequest) {
    return proxyRequest(request, '/catalog/assets/admin');
}

export async function PUT(request: NextRequest) {
    // Handle specific resource operations manually if needed or delegate with ID
    // Since proxyRequest strips /api/admin, we might need manual handling due to ID
    // But for now, let's fix GET/POST.
    // Actually, for /:id, it's a dynamic route file?
    // This is route.ts at root of assets, so it handles /api/admin/assets
    // PUT/DELETE usually need an ID, so they would be in [id]/route.ts?
    return proxyRequest(request);
}
