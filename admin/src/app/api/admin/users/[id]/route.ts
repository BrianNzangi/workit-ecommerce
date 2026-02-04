import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/shared/network';

export async function GET(request: NextRequest) {
    return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
    return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
    return proxyRequest(request);
}
