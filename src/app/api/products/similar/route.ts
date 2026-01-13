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

    // Fetch products from the collection
    const response = await fetch(
      `${BACKEND_URL}/api/store/collections/${collectionSlug}/products?limit=${limit}`,
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
      image: product.images?.[0]?.url || '',
      price: String(product.price),
      regular_price: product.compareAtPrice ? String(product.compareAtPrice) : undefined,
      categories: product.collections || [],
      brand: product.brand?.name,
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
