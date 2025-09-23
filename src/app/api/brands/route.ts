import { NextResponse } from 'next/server';
import woo from '@/lib/woocommerce';

interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
}

interface AttributeTerm {
  id: number;
  name: string;
  slug: string;
}

export async function GET() {
  try {
    // 1. Fetch all product attributes
    const attrsRes = await woo.get<ProductAttribute[]>('products/attributes');
    const attrs = attrsRes.data;

    // 2. Find the brand attribute
    const brandAttr = attrs.find((a) => a.slug === 'pa_brand');
    if (!brandAttr) return NextResponse.json([], { status: 200 });

    // 3. Fetch terms for the brand attribute
    const termsRes = await woo.get<AttributeTerm[]>(
      `products/attributes/${brandAttr.id}/terms`,
      { params: { per_page: 100 } }
    );

    const brands = termsRes.data.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      link: `/brand/${b.slug}`,
    }));

    return NextResponse.json(brands);
  } catch (err) {
    console.error('Error fetching brands:', err);
    return NextResponse.json([], { status: 200 });
  }
}