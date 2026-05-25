import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/utils/proxy-utils';
import { normalizeProducts } from '@/lib/product/product-normalization';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    try {
        const response = await proxyFetch(`/store/products?${searchParams.toString()}`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Backend API error: ${response.status}`);
        }

        const json = await response.json();

        if (Array.isArray(json.products)) {
            json.products = normalizeProducts(json.products);
        } else if (json.data && Array.isArray(json.data.products)) {
            json.data.products = normalizeProducts(json.data.products);
        }

        return NextResponse.json(json, { status: 200 });
    } catch (error) {
        console.error('❌ Failed to fetch products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}
