// src/app/api/collections/[slug]/route.ts
import { NextRequest } from 'next/server';
import { vendureClient } from '@/lib/vendure-client';
import { GET_COLLECTION_BY_SLUG } from '@/lib/vendure-queries';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    // Fetch collection from Vendure
    const { data } = await vendureClient.query({
      query: GET_COLLECTION_BY_SLUG,
      variables: {
        slug,
        options: {
          take: 12,
        },
      },
    }) as { data: any };

    const collection = data.collection;

    if (!collection) {
      return new Response(JSON.stringify({ error: 'Collection not found' }), { status: 404 });
    }

    // Transform product variants to product format for compatibility
    const products = collection.productVariants.items.map((variant: any) => ({
      id: variant.product.id,
      name: variant.product.name,
      slug: variant.product.slug,
      images: variant.product.featuredAsset ? [{ src: variant.product.featuredAsset.preview }] : [],
      price: (variant.priceWithTax / 100).toString(),
      regular_price: (variant.price / 100).toString(),
      variants: [variant],
    }));

    // Return collection info and products
    return new Response(JSON.stringify({
      parentCategory: {
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        image: collection.featuredAsset ? { src: collection.featuredAsset.preview } : null,
      },
      childCategories: collection.children.map((child: any) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
      })),
      products,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: unknown) {
    console.error(`❌ Failed to fetch collection for slug "${slug}":`, err);
    return new Response(JSON.stringify({ error: 'Failed to fetch collection' }), { status: 500 });
  }
}
