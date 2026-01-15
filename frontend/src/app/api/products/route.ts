import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract all possible query parameters
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('per_page') || searchParams.get('limit') || '12';
    const collectionSlug = searchParams.get('slug') || searchParams.get('collection');
    const collectionId = searchParams.get('collectionId');
    const brandId = searchParams.get('brandId') || searchParams.get('brand');
    const searchTerm = searchParams.get('search');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');

    // Build query parameters for backend REST API
    const params = new URLSearchParams({
      page,
      limit,
    });

    // Add optional filters
    if (collectionSlug) {
      params.append('collection', collectionSlug);
    }
    if (collectionId) {
      params.append('collectionId', collectionId);
    }
    if (brandId) {
      params.append('brandId', brandId);
    }
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    if (sort) {
      params.append('sort', sort);
    }
    if (minPrice) {
      params.append('minPrice', minPrice);
    }
    if (maxPrice) {
      params.append('maxPrice', maxPrice);
    }
    if (inStock) {
      params.append('inStock', inStock);
    }
    if (sortBy) {
      params.append('sortBy', sortBy);
    }
    if (sortOrder) {
      params.append('sortOrder', sortOrder);
    }

    // Always use the general products endpoint with filters
    const apiUrl = `${BACKEND_URL}/api/store/products?${params.toString()}`;

    // Fetch from backend REST API
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Backend API returned ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);

      return NextResponse.json({
        products: [],
        total: 0,
        totalPages: 0,
        page: 1,
      });
    }

    const data = await response.json();

    // Backend returns {success: true, data: {products: [], pagination: {}}}
    const responseData = data.data || data;

    // Transform backend response to match expected format
    const products = responseData.products?.map((item: any) => {
      // Backend returns {product: {...}, variants: [...]}
      const product = item.product || item;
      const variants = item.variants || product.variants || [];

      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('API Transform Debug:', {
          rawItem: item,
          productId: product.id,
          variantsCount: variants.length,
          firstVariantId: variants[0]?.id
        });
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: product.images?.map((img: any) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
          position: img.position,
        })) || [],
        image: product.images?.[0]?.url || '',
        // Use first variant's price if available (as number, not string)
        // Use first variant for flattened data (Single-Product Mode)
        price: variants[0]?.price ?? product.price ?? 0,
        compareAtPrice: variants[0]?.compareAtPrice ?? product.compareAtPrice,
        variantId: variants[0]?.id || '',
        stockOnHand: variants[0]?.inventory?.stockOnHand ?? 0,
        canBuy: variants[0]?.status === "active" && (!variants[0]?.inventory?.track || (variants[0]?.inventory?.stockOnHand ?? 0) > 0),
        variants: variants, // Include variants array for backward compatibility
        categories: product.collections || [],
        brand: product.brand, // Return full brand object

        condition: product.condition,
        shippingMethod: product.shippingMethod ? {
          id: product.shippingMethod.id,
          code: product.shippingMethod.code,
          name: product.shippingMethod.name,
          description: product.shippingMethod.description,
          isExpress: product.shippingMethod.isExpress || false,
        } : undefined,
      };
    }) || [];

    return NextResponse.json({
      products,
      total: responseData.pagination?.total || 0,
      totalPages: responseData.pagination?.totalPages || 1,
      page: responseData.pagination?.page || 1,
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
