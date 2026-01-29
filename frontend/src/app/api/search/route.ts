import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/proxy-utils";
import { normalizeProducts } from "@/lib/product-normalization";
import { Product } from "@/types/product";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing search term" }, { status: 400 });
  }

  try {
    // We use the store products endpoint for searching
    const response = await proxyFetch(
      `/store/products?search=${encodeURIComponent(query)}&limit=20`,
      {
        method: 'GET',
        // Cache search results briefly (1 minute)
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Search failed", status: response.status },
        { status: response.status }
      );
    }

    const json = await response.json();

    // The backend returns { data: { products: [], pagination: {} } }
    let products: Product[] = [];
    if (json.data && Array.isArray(json.data.products)) {
      // Use our normalization logic for consistent pricing and fields
      products = normalizeProducts(json.data.products);
    } else if (Array.isArray(json)) {
      products = normalizeProducts(json);
    }

    // Return the normalized products directly for the client search component
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("❌ Search Proxy Error:", error.message);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
