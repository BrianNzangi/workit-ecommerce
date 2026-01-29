/**
 * Homepage Collections API Route
 * 
 * This route proxies requests to the backend API to fetch homepage collections.
 * It follows the Storefront Integration Guide for secure data fetching.
 */

import { NextResponse } from 'next/server';

// Get backend URL from environment variable
// In development, defaults to localhost:3001
// In production, this MUST be set
const BACKEND_URL = process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '');

/**
 * GET /api/home-collection
 * 
 * Fetches homepage collections from the backend API
 * Query params:
 * - status: Filter by status (default: 'active')
 * - limit: Limit number of collections
 */
export async function GET(req: Request) {
  // Validate backend URL is configured
  if (!BACKEND_URL) {
    console.error('BACKEND_API_URL environment variable is not set');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'Backend API URL is not configured. Please set BACKEND_API_URL environment variable.'
        }
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'active';
  const limit = searchParams.get('limit');

  // Build query parameters
  const params = new URLSearchParams();
  params.append('status', status);
  if (limit) params.append('limit', limit);

  const url = `${BACKEND_URL}/store/homepage-collections?${params.toString()}`;


  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In production, you might need to add authentication here
        // 'Authorization': `Bearer ${process.env.BACKEND_API_TOKEN}`
      },
      // Cache for 5 minutes
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(`Backend API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: 'Failed to fetch homepage collections from backend'
          }
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Backend returns array directly, wrap it in expected format
    const homepageCollections = Array.isArray(data) ? data : [];

    // Transform to match frontend expectations
    const transformedCollections = homepageCollections.map((collection: any) => ({
      ...collection,
      products: collection.products?.map((product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.salePrice,
        compareAtPrice: product.originalPrice,
        salePrice: product.salePrice,
        originalPrice: product.originalPrice,
        // Map featuredImage to both image and images array
        image: product.featuredImage || '',
        images: product.featuredImage ? [{
          id: '1',
          url: product.featuredImage,
          position: 0
        }] : [],
        variants: (product.variants && product.variants.length > 0) ? product.variants : [{
          id: product.id,
          name: product.name,
          sku: product.sku || '',
          price: product.salePrice ?? 0,
          compareAtPrice: product.originalPrice,
          status: 'active',
          inventory: {
            track: true,
            stockOnHand: product.stockOnHand ?? 0,
          }
        }],
        variantId: (product.variants && product.variants.length > 0) ? product.variants[0].id : product.id,
        stockOnHand: product.stockOnHand || 0,
        canBuy: (product.stockOnHand ?? 0) > 0 || product.inStock,
        condition: product.condition,
        shippingMethod: product.shippingMethod,
        brand: product.brand,
      })) || []
    }));

    // Return the transformed data
    return NextResponse.json({
      success: true,
      data: {
        homepageCollections: transformedCollections
      }
    });
  } catch (error) {
    console.error('Error fetching homepage collections:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error while fetching homepage collections'
        }
      },
      { status: 500 }
    );
  }
}
