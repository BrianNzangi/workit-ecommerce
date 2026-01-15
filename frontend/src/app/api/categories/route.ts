import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/store/collections?take=100`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    const categories = data.data || [];

    // Transform if necessary, but assuming the new API returns the structure we need
    // or close enough. The previous implementation transformed Vendure to category format.
    // Let's assume the new API matches the expected Category type or close to it.

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
