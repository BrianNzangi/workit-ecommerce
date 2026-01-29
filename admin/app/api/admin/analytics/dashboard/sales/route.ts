import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxy-utils';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    return proxyRequest(request, `/analytics/dashboard/sales?range=${range}`);
}
