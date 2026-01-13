import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionSlug = searchParams.get('collection');

    // If a collection is specified, fetch products from that collection first
    // to determine which brands have products in that collection
    if (collectionSlug) {
      const productsRes = await fetch(
        `${BACKEND_URL}/api/store/products?collection=${collectionSlug}&limit=1000`,
        {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
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
        if (product.brand && product.brand.id) {
          const brandId = product.brand.id;
          if (!brandMap.has(brandId)) {
            brandMap.set(brandId, {
              id: brandId,
              name: product.brand.name,
              slug: product.brand.slug,
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
    const response = await fetch(`${BACKEND_URL}/api/store/brands`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Backend brands API returned ${response.status}`);
      return NextResponse.json([], { status: 200 });
    }

    const brands = await response.json();

    // Transform to match expected format
    const transformedBrands = brands.map((brand: any) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      link: `/brand/${brand.slug}`,
      count: brand._count?.products || 0,
    }));

    return NextResponse.json(transformedBrands);
  } catch (err) {
    console.error('Error fetching brands:', err);
    return NextResponse.json([], { status: 200 });
  }
}
