import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/utils/proxy-utils';
import { normalizeProduct } from '@/lib/product/product-normalization';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const response = await proxyFetch(`/store/products/${id}`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Backend API error: ${response.status}`);
        }

        const json = await response.json();

        // The backend returns { success: true, data: product }
        if (json.data) {
            json.data = normalizeProduct(json.data);
        }

        return NextResponse.json(json, { status: 200 });
    } catch (error) {
        console.error('❌ Failed to fetch product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}
