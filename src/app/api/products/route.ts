import { NextRequest, NextResponse } from 'next/server';
import woo from '@/lib/woocommerce';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '12';
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const params: any = {
      page,
      per_page: perPage,
      status: 'publish',
    };

    if (category) {
      params.category = category;
    }

    if (search) {
      params.search = search;
    }

    const response = await woo.get('/products', { params });

    return NextResponse.json({
      products: response.data,
      total: response.headers['x-wp-total'],
      totalPages: response.headers['x-wp-totalpages'],
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      error: 'Failed to fetch products'
    }, { status: 500 });
  }
}
