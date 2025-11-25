import { NextRequest, NextResponse } from 'next/server';
import { vendureClient } from '@/lib/vendure-client';
import { GET_PRODUCTS, SEARCH_PRODUCTS } from '@/lib/vendure-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '12');
    const collectionSlug = searchParams.get('category');
    const searchTerm = searchParams.get('search');

    const skip = (page - 1) * perPage;

    // If search term is provided, use search query
    if (searchTerm) {
      const { data } = await vendureClient.query({
        query: SEARCH_PRODUCTS,
        variables: {
          input: {
            term: searchTerm,
            take: perPage,
            skip,
            groupByProduct: true,
          },
        },
      }) as { data: any };

      const products = data.search.items.map((item: any) => ({
        id: item.productId,
        name: item.productName,
        slug: item.slug,
        description: item.description,
        images: item.productAsset ? [{ src: item.productAsset.preview }] : [],
        price: typeof item.priceWithTax === 'object' && 'value' in item.priceWithTax
          ? (item.priceWithTax.value / 100).toString()
          : ((item.priceWithTax.min || 0) / 100).toString(),
        regular_price: typeof item.price === 'object' && 'value' in item.price
          ? (item.price.value / 100).toString()
          : ((item.price.min || 0) / 100).toString(),
      }));

      return NextResponse.json({
        products,
        total: data.search.totalItems,
        totalPages: Math.ceil(data.search.totalItems / perPage),
      });
    }

    // Otherwise, use regular products query
    const options: any = {
      take: perPage,
      skip,
    };

    // Filter by collection if provided
    if (collectionSlug) {
      options.filter = {
        collectionSlug: {
          eq: collectionSlug,
        },
      };
    }

    const { data } = await vendureClient.query({
      query: GET_PRODUCTS,
      variables: { options },
    }) as { data: any };

    // Transform Vendure products to match WooCommerce format for compatibility
    const products = data.products.items.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      images: product.featuredAsset ? [{ src: product.featuredAsset.preview }] : [],
      price: product.variants[0] ? (product.variants[0].priceWithTax / 100).toString() : '0',
      regular_price: product.variants[0] ? (product.variants[0].price / 100).toString() : '0',
      variants: product.variants,
      categories: product.collections,
    }));

    return NextResponse.json({
      products,
      total: data.products.totalItems,
      totalPages: Math.ceil(data.products.totalItems / perPage),
    });
  } catch (error) {
    console.error('Error fetching products from Vendure:', error);
    return NextResponse.json({
      error: 'Failed to fetch products'
    }, { status: 500 });
  }
}
