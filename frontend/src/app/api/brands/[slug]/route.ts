import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/utils/proxy-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const response = await proxyFetch(`/store/brands/${slug}`, {
      method: 'GET',
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
      }
      console.error(`Backend brand API returned ${response.status}`);
      return NextResponse.json({ error: 'Failed to fetch brand' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Brand proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 });
  }
}
