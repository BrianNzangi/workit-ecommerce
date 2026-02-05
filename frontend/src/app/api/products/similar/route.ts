import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/proxy-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionSlug = searchParams.get('collectionSlug');
    const excludeProductId = searchParams.get('excludeProductId');
    const limit = searchParams.get('limit') || '8';

    if (!collectionSlug) {
      return NextResponse.json({
        error: 'collectionSlug is required'
      }, { status: 400 });
    }

    // Fetch products from backend via proxy
    const response = await proxyFetch(
      `/store/products?collection=${collectionSlug}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}`);
    }

    const data = await response.json();
    let products = data.products || [];

    if (excludeProductId) {
      products = products.filter((p: any) => p.id !== excludeProductId);
    }

    // Transform to match expected format
    const transformedProducts = products.map((product: any) => {
      const mainImage = product.assets?.[0]?.asset?.url || '';

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: product.assets?.map((a: any) => ({
          id: a.asset.id,
          url: a.asset.url,
          altText: a.asset.altText || product.name,
        })) || [],
        image: mainImage,
        price: Number(product.salePrice ?? 0),
        compareAtPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        categories: product.collections?.map((c: any) => c.collection) || [],
        brand: product.brand,
        canBuy: (product.stockOnHand ?? 0) > 0,
        variantId: product.id,
      };
    });

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return NextResponse.json({
      error: 'Failed to fetch similar products',
      products: []
    }, { status: 500 });
  }
}
