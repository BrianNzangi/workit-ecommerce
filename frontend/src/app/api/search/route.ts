import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing search term" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/store/products?search=${encodeURIComponent(query)}&limit=20`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}`);
    }

    const data = await response.json();
    const responseData = data.data || data;

    // Transform to match expected format
    const products = responseData.products?.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      images: product.images?.map((img: any) => ({
        id: img.id,
        src: img.url,
        url: img.url,
        altText: img.altText,
      })) || [],
      image: product.images?.[0]?.url || '',
      price: String(product.price),
      regular_price: product.compareAtPrice ? String(product.compareAtPrice) : undefined,
      categories: product.collections || [],
      brand: product.brand?.name,
    })) || [];

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Search Error:", error.message);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
