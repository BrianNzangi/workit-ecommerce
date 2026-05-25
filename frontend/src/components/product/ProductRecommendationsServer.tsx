import ProductRecommendations from "@/components/product/ProductRecommendations";
import { proxyFetch } from "@/lib/utils/proxy-utils";
import { normalizeProducts } from "@/lib/product/product-normalization";
import type { Product } from "@/types/product";

interface ProductRecommendationsServerProps {
  productId: string;
  categorySlugs: string[];
  revalidateSeconds?: number;
}

export default async function ProductRecommendationsServer({
  productId,
  categorySlugs,
  revalidateSeconds = 300,
}: ProductRecommendationsServerProps) {
  const similarResponses = await Promise.all(
    categorySlugs.map((categorySlug) =>
      proxyFetch(`/store/products?collection=${encodeURIComponent(categorySlug)}&limit=10`, {
        cache: "force-cache",
        next: { revalidate: revalidateSeconds },
        useRequestContext: false,
      }).catch(() => null),
    ),
  );

  const similarItemsMap = new Map<string, Product>();
  for (const similarResponse of similarResponses) {
    if (!similarResponse?.ok) continue;
    const data = await similarResponse.json();
    const mappedProducts = normalizeProducts(data.products || []);

    for (const similarProduct of mappedProducts) {
      if (similarProduct.id === productId) continue;
      if (!similarItemsMap.has(similarProduct.id)) {
        similarItemsMap.set(similarProduct.id, similarProduct);
      }
      if (similarItemsMap.size >= 5) break;
    }

    if (similarItemsMap.size >= 5) break;
  }

  let alsoViewed: Product[] = [];
  try {
    const alsoViewedResponse = await proxyFetch("/store/products?limit=20&offset=0", {
      cache: "force-cache",
      next: { revalidate: revalidateSeconds },
      useRequestContext: false,
    });

    if (alsoViewedResponse.ok) {
      const data = await alsoViewedResponse.json();
      alsoViewed = normalizeProducts(data.products || [])
        .filter((item) => item.id !== productId && !similarItemsMap.has(item.id))
        .slice(0, 5);
    }
  } catch (error) {
    console.error("Error fetching also viewed items:", error);
  }

  return (
    <ProductRecommendations
      similarItems={Array.from(similarItemsMap.values()).slice(0, 5)}
      alsoViewed={alsoViewed}
    />
  );
}
