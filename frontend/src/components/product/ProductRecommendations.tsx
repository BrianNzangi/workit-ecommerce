"use client"

import ColProductCard from "@/components/product/ColProductCard"
import SectionContainer from "@/components/layout/SectionContainer"
import { Product } from "@/types/product"

interface ProductRecommendationsProps {
  similarItems: Product[]
  alsoViewed: Product[]
}

export default function ProductRecommendations({
  similarItems,
  alsoViewed,
}: ProductRecommendationsProps) {
  return (
    <section className="mt-12 w-full bg-white py-6 md:py-8">
      <SectionContainer className="px-10 sm:px-12 lg:px-16 mb-8 py-6">
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
  )
}
