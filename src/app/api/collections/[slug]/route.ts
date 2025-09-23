// src/app/api/collections/[slug]/route.ts
import { NextRequest } from 'next/server';
import woo from '@/lib/woocommerce';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    // Step 1: Get the category by slug
    const categoryRes = await woo.get('products/categories', { params: { slug } });
    const category = categoryRes.data?.[0];

    if (!category) {
      return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
    }

    // Step 2: Fetch child categories (L2)
    const childrenRes = await woo.get('products/categories', { params: { parent: category.id } });
    const children = childrenRes.data || [];

    // Step 3: Determine which category to fetch products from:
    // - If there are children (L2), take the first L2
    // - Otherwise, use the parent category
    const targetCategoryId = children.length > 0 ? children[0].id : category.id;

    // Step 4: Fetch products for the target category
    const productRes = await woo.get('products', {
      params: { category: targetCategoryId, per_page: 12 },
    });

    // Step 5: Return both L2 info and products
    return new Response(JSON.stringify({
      parentCategory: category,
      childCategories: children,
      products: productRes.data,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: unknown) {
    console.error(`❌ Failed to fetch collection for slug "${slug}":`, err);
    return new Response(JSON.stringify({ error: 'Failed to fetch collection' }), { status: 500 });
  }
}
