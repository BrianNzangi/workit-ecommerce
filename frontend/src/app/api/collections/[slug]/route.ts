import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Attempt to find by slug via listing (since we might not have a direct slug endpoint exposed yet)
    // Or if the backend supports filter[slug]=...
    const response = await fetch(`${backendUrl}/api/store/collections?slug=${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      // If filter by slug isn't supported directly like this, we might get a list or 404
    }

    const data = await response.json();
    let collection = null;

    if (data.data && Array.isArray(data.data)) {
      collection = data.data.find((c: any) => c.slug === slug);
    } else if (data.data && !Array.isArray(data.data) && data.data.slug === slug) {
      collection = data.data;
    }

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}
