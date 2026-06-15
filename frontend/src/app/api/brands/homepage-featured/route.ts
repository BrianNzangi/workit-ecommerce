import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/utils/proxy-utils';

export async function GET(_request: NextRequest) {
  try {
    const response = await proxyFetch('/store/brands/homepage-featured', {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Homepage featured brands API returned ${response.status}`);
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
    console.error('Homepage featured brands proxy error:', err);
    return NextResponse.json({ brands: [] }, { status: 200 });
  }
}
