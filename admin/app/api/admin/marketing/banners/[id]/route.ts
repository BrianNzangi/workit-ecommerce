import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxy-utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return proxyRequest(request, `/banners/${id}`);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return proxyRequest(request, `/banners/${id}`);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return proxyRequest(request, `/banners/${id}`);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return proxyRequest(request, `/banners/${id}`);
}
