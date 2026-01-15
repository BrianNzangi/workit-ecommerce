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
        // Backend may return {product: {...}, variants: [...]} or flat structure
        const productObj = productData.product || productData;
        const variants = productData.variants || productObj.variants || [];

        const firstVariant = variants[0];
        const product = {
            id: productObj.id,
            name: productObj.name,
            slug: productObj.slug,
            description: productObj.description,
            short_description: productObj.shortDescription,
            images: productObj.images?.map((img: any) => ({
                id: img.id,
                src: img.url,
                url: img.url,
                altText: img.altText,
            })) || [],
            image: productObj.images?.[0]?.url || '',
            // Use first variant for flattened data (Single-Product Mode)
            price: firstVariant?.price ?? productObj.price ?? 0,
            regular_price: firstVariant?.compareAtPrice ?? productObj.originalPrice,
            variantId: firstVariant?.id || '',
            stockOnHand: firstVariant?.inventory?.stockOnHand ?? 0,
            canBuy: firstVariant?.status === "active" && (!firstVariant?.inventory?.track || (firstVariant?.inventory?.stockOnHand ?? 0) > 0),
            variants: variants, // Include variants array
            categories: productObj.collections?.map((col: any) => ({
                id: col.id,
                name: col.name,
                slug: col.slug,
            })) || [],
            brand: productObj.brand?.name,
            stock_status: firstVariant?.inventory?.stockOnHand > 0 ? 'instock' : 'outofstock',
            condition: productObj.condition,
            shippingMethod: productObj.shippingMethod ? {
                id: productObj.shippingMethod.id,
                code: productObj.shippingMethod.code,
                name: productObj.shippingMethod.name,
                description: productObj.shippingMethod.description,
                isExpress: productObj.shippingMethod.isExpress || false,
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
