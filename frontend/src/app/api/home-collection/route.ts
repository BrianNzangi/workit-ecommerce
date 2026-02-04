/**
 * Homepage Collections API Route
 * 
 * This route proxies requests to the backend API to fetch homepage collections.
 * It follows the Storefront Integration Guide for secure data fetching.
 */

import { NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/proxy-utils';
import { normalizeProducts } from '@/lib/product-normalization';

/**
 * GET /api/home-collection
 * 
 * Fetches homepage collections from the backend API
 * Query params:
 * - status: Filter by status (default: 'active')
 * - limit: Limit number of collections
 */
export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'active';
  const limit = searchParams.get('limit');

  // Build query parameters
  const params = new URLSearchParams();
  params.append('status', status);
  if (limit) params.append('limit', limit);

  try {
    const response = await proxyFetch(`/store/homepage-collections?${params.toString()}`, {
      method: 'GET',
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

    // Backend returns array directly,
    const homepageCollections = data.collections || (Array.isArray(data) ? data : []);

    // Transform to match frontend expectations
    const transformedCollections = homepageCollections.map((collection: any) => {
      // Backend returns products as an array of join objects: { product: { ... } }
      const products = (collection.products || []).map((p: any) => p.product).filter(Boolean);

      console.log(`Collection ${collection.title || collection.name}: Found ${products.length} products`);

      return {
        ...collection,
        products: normalizeProducts(products)
      };
    });

    console.log(`Returning ${transformedCollections.length} transformed collections`);

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
