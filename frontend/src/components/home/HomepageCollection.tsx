'use client';

import { useState, useEffect, useRef } from 'react';
import ProductCard from '../product/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useHomepageCollections, type HomepageCollectionData } from '@/hooks/useHomepageCollections';
import { getProductImageUrl } from '@/lib/image-utils';

/**
 * Single Collection Carousel Component
 * Renders a single collection with its products in a carousel layout
 */
interface CollectionCarouselProps {
  collection: HomepageCollectionData;
}

function CollectionCarousel({ collection }: CollectionCarouselProps) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleCards, setVisibleCards] = useState(2);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  const GAP = 16; // gap-4

  // Use products directly from collection (backend structure is simpler)
  const products = collection.products || [];
  const maxProductsToShow = 12; // Default limit

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);

        // Responsive visible cards based on screen width
        if (width < 640) {
          setVisibleCards(2); // Mobile: 2 cards
        } else if (width < 1024) {
          setVisibleCards(3); // Tablet: 3 cards
        } else if (width < 1280) {
          setVisibleCards(4); // Desktop: 4 cards
        } else {
          setVisibleCards(5); // Large desktop: 5 cards
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate card width based on container and visible cards
  const getCardWidth = () => {
    if (containerWidth <= 0) return 250;

    if (containerWidth < 640) {
      // Mobile: Make cards slightly wider, accounting for container padding
      return (containerWidth - GAP) / 2;
    }

    return (containerWidth - (GAP * (visibleCards - 1))) / visibleCards;
  };

  const cardWidth = getCardWidth();
  const maxScrollIndex = Math.max(0, products.length - visibleCards);

  const scroll = async (direction: 'left' | 'right') => {
    const newIndex =
      direction === 'left'
        ? Math.max(scrollIndex - 1, 0)
        : Math.min(scrollIndex + 1, maxScrollIndex);

    setScrollIndex(newIndex);

    // Calculate the exact scroll position
    const scrollAmount = newIndex * (cardWidth + GAP);

    await controls.start({
      x: -scrollAmount,
      transition: { duration: 0.5, ease: 'easeInOut' },
    });
  };

  const canScrollLeft = scrollIndex > 0;
  const canScrollRight = scrollIndex < maxScrollIndex;

  const renderSkeleton = () =>
    Array.from({ length: visibleCards }).map((_, index) => (
      <div
        key={index}
        className="flex-shrink-0 flex flex-col gap-2"
        style={{ width: `${cardWidth}px` }}
      >
        <div className="w-full aspect-square bg-gray-200 animate-pulse rounded-md" />
        <div className="h-4 bg-gray-300 animate-pulse rounded w-3/4" />
        <div className="h-4 bg-gray-300 animate-pulse rounded w-1/2" />
        <div className="h-6 bg-gray-300 animate-pulse rounded w-2/3" />
      </div>
    ));

  // Don't render if no products
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto font-[DM_SANS] space-y-2 py-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-2xl capitalize font-semibold text-gray-900">
            {collection.title}
          </h2>
          {products.length > 0 && (
            <a
              href={`/deal-details/${collection.slug}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
            >
              View All →
            </a>
          )}
        </div>
        {collection.subtitle && (
          <h3 className="text-lg md:text-xl text-gray-600 mt-1">
            {collection.subtitle}
          </h3>
        )}
        {collection.description && (
          <p className="text-base text-gray-700 mt-2">
            {collection.description}
          </p>
        )}
      </div>

      <div className="relative">
        {/* Carousel arrows - hidden on mobile, show on tablet and up when needed */}
        {products.length > visibleCards && (
          <>
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`hidden sm:block absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full shadow-lg transition-all duration-200 ${canScrollLeft
                ? 'bg-gray-100 hover:bg-gray-50 text-gray-700 hover:text-gray-900 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              aria-label="Previous products"
            >
              <ChevronLeft size={20} className="md:w-4 md:h-4" />
            </button>

            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`hidden sm:block absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full shadow-lg transition-all duration-200 ${canScrollRight
                ? 'bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              aria-label="Next products"
            >
              <ChevronRight size={20} className="md:w-4 md:h-4" />
            </button>
          </>
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={containerRef} className="overflow-hidden">
            <motion.div
              animate={controls}
              className="flex gap-4"
              initial={{ x: 0 }}
            >
              {products.length === 0
                ? renderSkeleton()
                : products.slice(0, maxProductsToShow).map((product) => {
                  // Safely handle price data
                  const safePrice = product.price ?? 0;
                  const safeComparePrice = product.compareAtPrice ?? null;

                  return (
                    <div
                      key={product.id}
                      className="flex-shrink-0"
                      style={{ width: `${cardWidth}px` }}
                    >
                      <ProductCard
                        id={parseInt(product.id)}
                        name={product.name}
                        slug={product.slug}
                        link={`/deal-details/${product.slug}`}
                        price={String(safePrice)}
                        regular_price={safeComparePrice ? String(safeComparePrice) : undefined}
                        image={getProductImageUrl(product.images?.[0]?.url, 'card')}
                        images={product.images?.map((img) => ({
                          src: getProductImageUrl(img.url, 'card')
                        })) || []}
                        type="simple"
                        shippingMethod={product.shippingMethod}
                        condition={product.condition}
                      />
                    </div>
                  );
                })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Homepage Collections Component
 * Fetches and displays all active homepage collections
 */
export default function HomepageCollection() {
  const { collections, loading, error } = useHomepageCollections({ status: 'active' });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Error loading collections: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {collections.map((collection) => (
        <CollectionCarousel key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
