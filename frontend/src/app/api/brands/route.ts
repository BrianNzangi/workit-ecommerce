import { NextRequest, NextResponse } from 'next/server';
import { proxyFetch } from '@/lib/proxy-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionSlug = searchParams.get('collection');

    // If a collection is specified, fetch products from that collection first
    // to determine which brands have products in that collection
    if (collectionSlug) {
      const productsRes = await proxyFetch(
        `/store/products?collection=${collectionSlug}&limit=1000`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      if (!productsRes.ok) {
        console.error(`Backend products API returned ${productsRes.status}`);
        return NextResponse.json([], { status: 200 });
      }

      const productsData = await productsRes.json();
      const products = productsData.data?.products || productsData.products || [];

      // Extract unique brands from products in this collection
      const brandMap = new Map();
      products.forEach((product: any) => {
        if (product.brand && (product.brand.id || product.brandId)) {
          const brandId = product.brand.id || product.brandId;
          if (!brandMap.has(brandId)) {
            brandMap.set(brandId, {
              id: brandId,
              name: product.brand.name || 'Unknown',
              slug: product.brand.slug || 'unknown',
              count: 1,
            });
          } else {
            const brand = brandMap.get(brandId);
            brand.count += 1;
          }
        }
      });

      const brands = Array.from(brandMap.values()).map((brand) => ({
        ...brand,
        link: `/brand/${brand.slug}`,
      }));

      return NextResponse.json(brands);
    }

    // If no collection specified, fetch all brands from backend
    const response = await proxyFetch('/store/brands', {
      method: 'GET',
      next: { revalidate: 3600 }, // Brands don't change often, cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Backend brands API returned ${response.status}`);
      return NextResponse.json([], { status: 200 });
    }

    const brands = await response.json();

    // Transform to match expected format
    const transformedBrands = Array.isArray(brands) ? brands.map((brand: any) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      link: `/brand/${brand.slug}`,
      count: brand._count?.products || 0,
    })) : [];

    return NextResponse.json(transformedBrands);
  } catch (err) {
    console.error('❌ Brands Proxy Error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
