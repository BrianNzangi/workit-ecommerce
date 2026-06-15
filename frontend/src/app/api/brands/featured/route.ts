import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/utils/proxy-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionSlug = searchParams.get('collectionSlug');

    if (!collectionSlug) {
      return NextResponse.json({ brands: [] }, { status: 200 });
    }

    const response = await proxyFetch(`/store/brands/featured?collectionSlug=${collectionSlug}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Featured brands API returned ${response.status}`);
      return NextResponse.json({ brands: [] }, { status: 200 });
    }

    const data = await response.json();
    const brands = data.brands || [];

    return NextResponse.json({ brands }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Featured brands proxy error:', err);
    return NextResponse.json({ brands: [] }, { status: 200 });
  }
}
