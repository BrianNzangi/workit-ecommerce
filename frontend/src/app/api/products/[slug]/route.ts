import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Fetch from backend REST API using the dedicated product detail endpoint
        const apiUrl = `${BACKEND_URL}/store/products/${slug}`;

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
        // The backend now provides a "Simple Product" model without a separate Variant table
        const productObj = productData;

        // Map backend images (source) to frontend images (url)
        const mappedImages = productObj.images?.map((img: any) => ({
            id: img.id,
            src: img.source || img.url || img.preview,
            url: img.source || img.url || img.preview,
            altText: img.altText || productObj.name,
            position: img.sortOrder ?? 0,
        })) || [];

        // If no images from relation, check if there's a featuredImage string (though backend standardizes this)
        const mainImage = mappedImages[0]?.url || productObj.featuredImage || '';

        // Create a fallback variant for the "Simple Product" model
        // This ensures the frontend components that expect variants still work
        const fallbackVariant = {
            id: productObj.id, // Use product ID as variant ID
            name: productObj.name,
            sku: productObj.sku || '',
            price: productObj.salePrice ?? 0,
            compareAtPrice: productObj.originalPrice,
            status: 'active',
            inventory: {
                track: true,
                stockOnHand: productObj.stockOnHand ?? 0,
            }
        };

        const product = {
            id: productObj.id,
            name: productObj.name,
            slug: productObj.slug,
            description: productObj.description,
            short_description: productObj.shortDescription || productObj.description?.substring(0, 160),
            images: mappedImages,
            image: mainImage,
            price: productObj.salePrice ?? 0,
            compareAtPrice: productObj.originalPrice,
            variantId: productObj.id, // Fallback to product ID
            stockOnHand: productObj.stockOnHand ?? 0,
            canBuy: (productObj.stockOnHand ?? 0) > 0,
            variants: [fallbackVariant], // Wrap fallback in array
            categories: productObj.collections?.map((col: any) => ({
                id: col.id,
                name: col.name,
                slug: col.slug,
            })) || [],
            brand: productObj.brand?.name || productObj.brand,
            stock_status: (productObj.stockOnHand ?? 0) > 0 ? 'instock' : 'outofstock',
            condition: productObj.condition,
            shippingMethod: productObj.shippingMethod ? {
                id: productObj.shippingMethod.id,
                code: productObj.shippingMethod.code,
                name: productObj.shippingMethod.name,
                description: productObj.shippingMethod.description,
                isExpress: productObj.shippingMethod.isExpress || false,
            } : undefined,
            createdAt: productObj.createdAt,
            updatedAt: productObj.updatedAt,
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
