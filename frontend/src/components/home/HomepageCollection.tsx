'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ProductCard from '../product/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useHomepageCollections, type HomepageCollectionData } from '@/hooks/useHomepageCollections';
import HorizontalBanner from '../banners/HorizontalBanner';
import React from 'react';

interface CollectionCarouselProps {
  collection: HomepageCollectionData;
}

function CollectionCarousel({ collection }: CollectionCarouselProps) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [visibleCards, setVisibleCards] = useState(2);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  const GAP = 16;
  const MIN_SWIPE_DISTANCE = 40;
  const products = collection.products || [];
  const displayedProducts = products.slice(0, 12);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateMobileState = () => setIsMobile(mediaQuery.matches);

    updateMobileState();
    mediaQuery.addEventListener('change', updateMobileState);
    return () => mediaQuery.removeEventListener('change', updateMobileState);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      setContainerWidth(width);

      if (width < 640) setVisibleCards(2);
      else if (width < 1024) setVisibleCards(3);
      else if (width < 1280) setVisibleCards(4);
      else setVisibleCards(5);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getCardWidth = () => {
    if (containerWidth <= 0) return 250;
    if (containerWidth < 640) return (containerWidth - GAP) / 2;
    return (containerWidth - (GAP * (visibleCards - 1))) / visibleCards;
  };

  const cardWidth = getCardWidth();
  const maxScrollIndex = Math.max(0, displayedProducts.length - visibleCards);

  const scrollToIndex = useCallback(async (index: number) => {
    const boundedIndex = Math.min(Math.max(index, 0), maxScrollIndex);
    setScrollIndex(boundedIndex);

    await controls.start({
      x: -(boundedIndex * (cardWidth + GAP)),
      transition: { duration: 0.5, ease: 'easeInOut' },
    });
  }, [cardWidth, controls, maxScrollIndex]);

  const scroll = useCallback(async (direction: 'left' | 'right', loop = false) => {
    const nextIndex = direction === 'left'
      ? (scrollIndex <= 0 ? (loop ? maxScrollIndex : 0) : scrollIndex - 1)
      : (scrollIndex >= maxScrollIndex ? (loop ? 0 : maxScrollIndex) : scrollIndex + 1);

    await scrollToIndex(nextIndex);
  }, [maxScrollIndex, scrollIndex, scrollToIndex]);

  useEffect(() => {
    if (!isMobile || displayedProducts.length <= visibleCards) return;

    const timer = setInterval(() => {
      void scroll('right', true);
    }, 2800);

    return () => clearInterval(timer);
  }, [displayedProducts.length, isMobile, visibleCards, scroll]);

  useEffect(() => {
    controls.set({ x: -(scrollIndex * (cardWidth + GAP)) });
  }, [controls, scrollIndex, cardWidth]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!isMobile) return;
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;

    if (distance > MIN_SWIPE_DISTANCE) {
      void scroll('right', true);
    } else if (distance < -MIN_SWIPE_DISTANCE) {
      void scroll('left', true);
    }
  };

  const canScrollLeft = scrollIndex > 0;
  const canScrollRight = scrollIndex < maxScrollIndex;

  const renderSkeleton = () =>
    Array.from({ length: visibleCards }).map((_, index) => (
      <div
        key={index}
        className="shrink-0 flex flex-col gap-2"
        style={{ width: `${cardWidth}px` }}
      >
        <div className="w-full aspect-square bg-gray-200 animate-pulse rounded-md" />
        <div className="h-4 bg-gray-300 animate-pulse rounded w-3/4" />
        <div className="h-4 bg-gray-300 animate-pulse rounded w-1/2" />
        <div className="h-6 bg-gray-300 animate-pulse rounded w-2/3" />
      </div>
    ));

  if (displayedProducts.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto font-sans space-y-2 py-4 md:py-2">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg md:text-2xl capitalize font-bold text-gray-900">
            {collection.title}
          </h2>
          <a
            href={`/deal-details/${collection.slug}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
          >
            View All {'->'}
          </a>
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
        {displayedProducts.length > visibleCards && (
          <>
            <button
              onClick={() => void scroll('left', true)}
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
              onClick={() => void scroll('right', true)}
              disabled={!canScrollRight}
              className={`hidden sm:block absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full shadow-lg transition-all duration-200 ${canScrollRight
                ? 'bg-secondary-400/20 hover:bg-secondary-900 text-gray-50 hover:text-primary-900 cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              aria-label="Next products"
            >
              <ChevronRight size={20} className="md:w-4 md:h-4" />
            </button>
          </>
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={containerRef}
            className="overflow-hidden"
            style={{ touchAction: 'pan-y' }}
            onTouchStart={isMobile ? onTouchStart : undefined}
            onTouchMove={isMobile ? onTouchMove : undefined}
            onTouchEnd={isMobile ? onTouchEnd : undefined}
          >
            <motion.div
              animate={controls}
              className="flex gap-4"
              initial={{ x: 0 }}
            >
              {displayedProducts.length === 0
                ? renderSkeleton()
                : displayedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="shrink-0"
                    style={{ width: `${cardWidth}px` }}
                  >
                    <ProductCard {...product} />
                  </div>
                ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomepageCollection() {
  const { collections, loading, error } = useHomepageCollections({ status: 'active' });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-100">
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
    <div className="space-y-6 md:space-y-7">
      {collections.map((collection, index) => (
        <React.Fragment key={collection.id}>
          <CollectionCarousel collection={collection} />
          {index === 2 && <HorizontalBanner position="MIDDLE" />}
          {index === collections.length - 1 && <HorizontalBanner position="BOTTOM" />}
        </React.Fragment>
      ))}
    </div>
  );
}
