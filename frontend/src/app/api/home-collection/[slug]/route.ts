import { NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/utils/proxy-utils';
import { normalizeProducts } from '@/lib/product/product-normalization';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        const response = await proxyFetch('/store/homepage-collections?status=active', {
            method: 'GET',
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'BACKEND_ERROR', message: 'Failed to fetch collections' },
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        const collections: any[] = data.collections || (Array.isArray(data) ? data : []);

        const collection = collections.find(
            (c: any) => c.slug === slug
        );

        if (!collection) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: 'NOT_FOUND', message: `Collection "${slug}" not found` },
                },
                { status: 404 }
            );
        }

        const transformed = {
            ...collection,
            products: normalizeProducts(
                (collection.products || [])
                    .map((p: any) => p?.product || p)
                    .filter(Boolean)
            ).slice(0, 12),
        };

        return NextResponse.json({
            success: true,
            data: { collection: transformed },
        });
    } catch (error) {
        console.error(`Error fetching collection "${slug}":`, error);
        return NextResponse.json(
            {
                success: false,
                error: { code: 'SERVER_ERROR', message: 'Internal server error' },
            },
            { status: 500 }
        );
    }
}
