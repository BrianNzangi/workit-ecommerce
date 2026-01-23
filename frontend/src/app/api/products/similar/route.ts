import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

    // Fetch products from the collection using the general store products endpoint
    const response = await fetch(
      `${BACKEND_URL}/store/products?collection=${collectionSlug}&limit=${limit}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}`);
    }

    const data = await response.json();
    const responseData = data.data || data;

    // Filter out the excluded product if specified
    let products = responseData.products || [];
    if (excludeProductId) {
      products = products.filter((p: any) => p.id !== excludeProductId);
    }

    // Transform to match expected format
    const transformedProducts = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      images: product.images?.map((img: any) => ({
        id: img.id,
        src: img.url,
        url: img.url,
        altText: img.altText,
      })) || [],
      image: product.featuredImage || product.image || '',
      price: Number(product.salePrice || product.price || 0),
      compareAtPrice: (product.originalPrice || product.compareAtPrice) ? Number(product.originalPrice || product.compareAtPrice) : undefined,
      categories: product.collections || [],
      brand: product.brand,
      canBuy: product.stockOnHand > 0 || product.inStock,
      variantId: product.id, // Fallback for simple products
    }));

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return NextResponse.json({
      error: 'Failed to fetch similar products',
      products: []
    }, { status: 500 });
  }
}
