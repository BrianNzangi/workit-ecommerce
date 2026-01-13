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

  const url = `${BACKEND_URL}/api/store/homepage-collections?${params.toString()}`;


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

    // Return the data in a consistent format
    return NextResponse.json(data);
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
