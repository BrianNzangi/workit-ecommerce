import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/shared/network';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    return proxyRequest(request, `/marketing/homepage/admin/${id}`);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    return proxyRequest(request, `/marketing/homepage/admin/${id}`);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    return proxyRequest(request, `/marketing/homepage/admin/${id}`);
}
