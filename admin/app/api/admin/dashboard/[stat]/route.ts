import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxy-utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ stat: string }> }) {
    const { stat } = await params;
    return proxyRequest(request, `/analytics/dashboard/${stat}`);
}
