import { NextRequest, NextResponse } from 'next/server';
import { getProductsByCategory, getProductsByCollection } from '@/lib/woocommerce';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const collectionSlug = searchParams.get('collectionSlug');
    const excludeProductId = searchParams.get('excludeProductId');
    const limit = searchParams.get('limit') || '8';

    if (!categoryId && !collectionSlug) {
      return NextResponse.json({
        error: 'Either categoryId or collectionSlug is required'
      }, { status: 400 });
    }

    let products;

    if (collectionSlug) {
      products = await getProductsByCollection(
        collectionSlug,
        excludeProductId ? parseInt(excludeProductId) : undefined,
        parseInt(limit)
      );
    } else {
      products = await getProductsByCategory(
        parseInt(categoryId!),
        excludeProductId ? parseInt(excludeProductId) : undefined,
        parseInt(limit)
      );
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return NextResponse.json({
      error: 'Failed to fetch similar products'
    }, { status: 500 });
  }
}
