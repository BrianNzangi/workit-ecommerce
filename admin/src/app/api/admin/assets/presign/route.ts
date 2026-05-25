import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/shared/network';

export async function POST(request: NextRequest) {
    return proxyRequest(request, '/catalog/assets/admin/presign');
}
