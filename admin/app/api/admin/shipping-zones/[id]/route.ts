import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxy-utils';

export async function GET(request: NextRequest) {
    return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
    return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
    return proxyRequest(request);
}
