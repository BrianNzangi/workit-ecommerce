import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxy-utils';

export async function PATCH(request: NextRequest) {
    return proxyRequest(request);
}
