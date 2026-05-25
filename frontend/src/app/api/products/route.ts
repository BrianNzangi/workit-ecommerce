import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/utils/proxy-utils';
import { normalizeProducts } from '@/lib/product/product-normalization';

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

    // Build query parameters for backend
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (collectionSlug) params.append('collection', collectionSlug);
    if (brandId) params.append('brand', brandId);
    if (searchTerm) params.append('q', searchTerm);

    // Fetch from backend via proxy
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
    const products = normalizeProducts(data.products || []);

    return NextResponse.json({
      products,
      total: products.length, // backend doesn't return total yet in this endpoint
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
