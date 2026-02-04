import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/proxy-utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Fetch from backend-v2 via proxy
        const response = await proxyFetch(`/store/products/${slug}`);

        if (!response.ok) {
            console.error(`Backend API returned ${response.status}`);
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        const productObj = await response.json();

        // Map backend images (source) to frontend images (url)
        const mappedImages = productObj.assets?.map((a: any) => ({
            id: a.asset.id,
            src: a.asset.source || a.asset.preview || '',
            url: a.asset.source || a.asset.preview || '',
            altText: a.asset.name || productObj.name,
            position: a.sortOrder ?? 0,
            featured: a.featured,
        })) || [];

        // Main image fallback
        const featuredAsset = mappedImages.find((img: any) => img.featured) || mappedImages[0];
        const mainImage = featuredAsset?.url || productObj.featuredImage || '';

        // Create a fallback variant for the "Simple Product" model
        const fallbackVariant = {
            id: productObj.id,
            name: productObj.name,
            sku: productObj.sku || '',
            price: Number(productObj.salePrice ?? 0),
            compareAtPrice: productObj.originalPrice ? Number(productObj.originalPrice) : undefined,
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
            price: Number(productObj.salePrice ?? 0),
            compareAtPrice: productObj.originalPrice ? Number(productObj.originalPrice) : undefined,
            variantId: productObj.id,
            stockOnHand: productObj.stockOnHand ?? 0,
            canBuy: (productObj.stockOnHand ?? 0) > 0,
            variants: [fallbackVariant],
            categories: productObj.collections?.map((c: any) => ({
                id: c.collection.id,
                name: c.collection.name,
                slug: c.collection.slug,
            })) || [],
            brand: productObj.brand,
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
