import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxy-utils';

export async function GET(request: NextRequest) {
    return proxyRequest(request);
}

export async function POST(request: NextRequest) {
    return proxyRequest(request);
}
