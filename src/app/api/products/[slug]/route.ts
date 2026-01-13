import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Fetch from backend REST API using the dedicated product detail endpoint
        const apiUrl = `${BACKEND_URL}/api/store/products/${slug}`;

        const response = await fetch(apiUrl, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Backend API returned ${response.status}`);
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        const result = await response.json();

        // Check if request was successful
        if (!result.success) {
            return NextResponse.json(
                { error: result.error?.message || 'Product not found' },
                { status: 404 }
            );
        }

        const productData = result.data;

        if (!productData) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Transform backend response to match expected format
        const product = {
            id: productData.id,
            name: productData.name,
            slug: productData.slug,
            description: productData.description,
            short_description: productData.shortDescription,
            images: productData.images?.map((img: any) => ({
                id: img.id,
                src: img.url,
                url: img.url,
                altText: img.altText,
            })) || [],
            image: productData.images?.[0]?.url || '',
            price: String(productData.price),
            regular_price: productData.compareAtPrice ? String(productData.compareAtPrice) : undefined,
            variants: productData.variants || [],
            categories: productData.collections?.map((col: any) => ({
                id: col.id,
                name: col.name,
                slug: col.slug,
            })) || [],
            brand: productData.brand?.name,
            stock_status: productData.stockQuantity > 0 ? 'instock' : 'outofstock',
            condition: productData.condition,
            shippingMethod: productData.shippingMethod ? {
                id: productData.shippingMethod.id,
                code: productData.shippingMethod.code,
                name: productData.shippingMethod.name,
                description: productData.shippingMethod.description,
                isExpress: productData.shippingMethod.isExpress || false,
            } : undefined,
        };

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Error fetching product from backend:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}
