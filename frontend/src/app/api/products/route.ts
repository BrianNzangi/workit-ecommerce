import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/proxy-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract all possible query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('per_page') || searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    const collectionSlug = searchParams.get('slug') || searchParams.get('collection');
    const brandId = searchParams.get('brandId') || searchParams.get('brand');
    const searchTerm = searchParams.get('search') || searchParams.get('q');

    // Build query parameters for backend-v2
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (collectionSlug) params.append('collection', collectionSlug);
    if (brandId) params.append('brand', brandId);
    if (searchTerm) params.append('q', searchTerm);

    // Fetch from backend-v2 via proxy
    const response = await proxyFetch(`/store/products?${params.toString()}`);

    if (!response.ok) {
      console.error(`Backend API returned ${response.status}`);
      return NextResponse.json({
        products: [],
        total: 0,
        totalPages: 0,
        page: 1,
      });
    }

    const data = await response.json();
    const products = (data.products || []).map((product: any) => {
      // Find the featured asset or default to the first one
      const featuredProductAsset = product.assets?.find((a: any) => a.featured) || product.assets?.[0];
      const mainImage = featuredProductAsset?.asset?.source || featuredProductAsset?.asset?.preview || '';

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: product.assets?.map((a: any) => ({
          id: a.asset.id,
          url: a.asset.source || a.asset.preview || '',
          source: a.asset.source,
          preview: a.asset.preview,
          featured: a.featured,
          altText: a.asset.name || product.name,
        })) || [],
        image: mainImage,
        price: Number(product.salePrice ?? 0),
        compareAtPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        variantId: product.id,
        stockOnHand: product.stockOnHand ?? 0,
        canBuy: (product.stockOnHand ?? 0) > 0,
        categories: product.collections?.map((c: any) => c.collection) || [],
        brand: product.brand,
        condition: product.condition,
      };
    });

    return NextResponse.json({
      products,
      total: products.length, // backend-v2 doesn't return total yet in this endpoint
      totalPages: Math.ceil(products.length / limit) || 1,
      page: page,
    });
  } catch (error) {
    console.error('Error fetching products from backend:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        products: [],
        total: 0,
        totalPages: 0,
      },
      { status: 500 }
    );
  }
}
