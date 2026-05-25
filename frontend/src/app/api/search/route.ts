import { NextRequest, NextResponse } from "next/server";
import { proxyFetch } from "@/lib/utils/proxy-utils";
import { normalizeProducts } from "@/lib/product/product-normalization";
import { sendMetaEvent } from "@/lib/meta/meta-conversions";
import { Product } from "@/types/product";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q");
  const shouldTrack = searchParams.get("track") === "1";

  if (!query) {
    return NextResponse.json({ error: "Missing search term" }, { status: 400 });
  }

  try {
    // Use the dedicated store search endpoint.
    const response = await proxyFetch(
      `/store/products/search?q=${encodeURIComponent(query)}&limit=20`,
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

    const rawProducts =
      Array.isArray(json?.products) ? json.products :
        (Array.isArray(json?.data?.products) ? json.data.products :
          (Array.isArray(json) ? json : []));

    // Use normalization logic for consistent pricing and fields.
    const products: Product[] = normalizeProducts(rawProducts);

    if (shouldTrack) {
      void sendMetaEvent({
        request: req,
        eventName: "Search",
        eventId: `search:${query}:${Date.now()}`,
        eventSourceUrl: req.headers.get("referer"),
        customData: {
          search_string: query,
          num_items: products.length,
          content_category: "product_search",
        },
      });
    }

    // Return the normalized products directly for the client search component
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("❌ Search Proxy Error:", error.message);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
