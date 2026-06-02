import ColProductCard from "@/components/product/cards/ColProductCard";
import SectionContainer from "@/components/layout/SectionContainer";
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
      proxyFetch(`/store/products?collection=${encodeURIComponent(categorySlug)}&sortBy=sales&limit=10`, {
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
    const alsoViewedResponse = await proxyFetch("/store/products?sortBy=sales&limit=20&offset=0", {
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

  const similarItems = Array.from(similarItemsMap.values()).slice(0, 5);

  return (
    <section className="w-full bg-white py-4 md:py-8">
      <SectionContainer className="mb-8 py-4 md:py-6">
        <div className="pb-6 md:pb-8">
          <h2 className="mb-2 text-lg md:text-2xl font-bold text-secondary-900">
            Similar Items You Might Like
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
            {similarItems.length > 0 ? (
              similarItems.map((item) => (
                <ColProductCard key={item.id} {...item} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-300">
                No similar items available.
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-lg md:text-2xl font-bold text-secondary-900">
            People Who Viewed This Item Also Viewed
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
            {alsoViewed.length > 0 ? (
              alsoViewed.map((item) => (
                <ColProductCard key={item.id} {...item} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-300">
                No related items available.
              </p>
            )}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
