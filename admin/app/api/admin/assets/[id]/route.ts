import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxy-utils';

export async function DELETE(request: NextRequest) {
    return proxyRequest(request);
}
